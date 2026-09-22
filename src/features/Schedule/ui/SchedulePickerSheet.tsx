import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { ScheduleData, ScheduleRule } from '@/shared/domain/task'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'

const WEEKDAYS = [
	{ value: 1, label: 'Пн' },
	{ value: 2, label: 'Вт' },
	{ value: 3, label: 'Ср' },
	{ value: 4, label: 'Чт' },
	{ value: 5, label: 'Пт' },
	{ value: 6, label: 'Сб' },
	{ value: 0, label: 'Вс' }
] as const

type RuleType = ScheduleRule['type']

export type SchedulePickerSheetRef = {
	present: (initial?: ScheduleData | null) => void
	dismiss: () => void
}

type Props = {
	onConfirm: (data: ScheduleData | null) => void
}

export const SchedulePickerSheet = forwardRef<SchedulePickerSheetRef, Props>(
	function SchedulePickerSheet({ onConfirm }, ref) {
		const { theme } = useUnistyles()
		const sheetRef = useRef<TrueSheet>(null)

		const [ruleType, setRuleType] = useState<RuleType | 'none'>('none')
		const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([
			1, 3, 5
		])
		const [weeklyTime, setWeeklyTime] = useState('') // was '20:00'
		const [dailyTimesText, setDailyTimesText] = useState('') // was '09:00, 19:00'
		const [onceDate, setOnceDate] = useState('')
		const [onceTime, setOnceTime] = useState('')

		const resetFromData = (data?: ScheduleData | null) => {
			if (!data) {
				setRuleType('none')
				setSelectedWeekdays([1, 3, 5])
				setWeeklyTime('20:00')
				setDailyTimesText('09:00, 19:00')
				setOnceDate('')
				setOnceTime('')
				return
			}

			const { rule } = data
			setRuleType(rule.type)

			if (rule.type === 'weekly') {
				const weekdays = [...new Set(rule.slots.map((slot) => slot.weekday))]
				setSelectedWeekdays(weekdays)
				const firstTime = rule.slots.find((slot) => slot.time)?.time ?? ''
				setWeeklyTime(firstTime)
			}

			if (rule.type === 'daily') {
				const timesWithValue = rule.times
					.map((slot) => slot.time)
					.filter((time): time is string => Boolean(time))
				setDailyTimesText(timesWithValue.join(', '))
			}

			if (rule.type === 'once' && rule.occurrences[0]) {
				setOnceDate(rule.occurrences[0].date)
				setOnceTime(rule.occurrences[0].time ?? '')
			}
		}

		useImperativeHandle(ref, () => ({
			present: (initial) => {
				resetFromData(initial)
				sheetRef.current?.present()
			},
			dismiss: () => {
				sheetRef.current?.dismiss()
			}
		}))

		const toggleWeekday = (weekday: number) => {
			setSelectedWeekdays((current) => {
				if (current.includes(weekday)) {
					return current.filter((value) => value !== weekday)
				}
				return [...current, weekday].sort((valueA, valueB) => {
					const order = [1, 2, 3, 4, 5, 6, 0]
					return order.indexOf(valueA) - order.indexOf(valueB)
				})
			})
		}

		const parseTimes = (text: string): string[] => {
			return text
				.split(',')
				.map((part) => part.trim())
				.filter((part) => /^\d{1,2}:\d{2}$/.test(part))
		}

		const handleConfirm = () => {
			if (ruleType === 'none') {
				onConfirm(null)
				sheetRef.current?.dismiss()
				return
			}

			let rule: ScheduleRule

			if (ruleType === 'weekly') {
				const normalizedTime = weeklyTime.trim()
				rule = {
					type: 'weekly',
					slots: selectedWeekdays.map((weekday) => ({
						weekday,
						time: normalizedTime.length > 0 ? normalizedTime : null
					}))
				}
			} else if (ruleType === 'daily') {
				const times = parseTimes(dailyTimesText)
				rule = {
					type: 'daily',
					times: times.length > 0 ? times.map((time) => ({ time })) : [] // every day, no specific time — paired with utils change above
				}
			} else if (ruleType === 'once') {
				rule = {
					type: 'once',
					occurrences: [
						{
							date: onceDate.trim(),
							time: onceTime.trim() ? onceTime.trim() : null
						}
					]
				}
			} else {
				// monthly / yearly — placeholder minimal
				rule = {
					type: 'monthly',
					occurrences: [{ dayOfMonth: 1, time: null }]
				}
			}

			onConfirm({ rule, exceptions: [] })
			sheetRef.current?.dismiss()
		}

		return (
			<TrueSheet
				ref={sheetRef}
				detents={['auto']}
				cornerRadius={STYLE_VARS.radius_2xl}
			>
				<View style={styles.Content}>
					<Text style={styles.Title}>Повтор</Text>

					<View style={styles.TypeRow}>
						{(
							[
								['none', 'Нет'],
								['once', 'Один раз'],
								['daily', 'Ежедневно'],
								['weekly', 'Еженедельно']
							] as const
						).map(([value, label]) => (
							<Pressable
								key={value}
								style={[
									styles.TypeChip,
									ruleType === value && styles.TypeChip_active
								]}
								onPress={() => setRuleType(value)}
							>
								<Text
									style={[
										styles.TypeChip__label,
										ruleType === value && styles.TypeChip__label_active
									]}
								>
									{label}
								</Text>
							</Pressable>
						))}
					</View>

					{ruleType === 'weekly' && (
						<View style={styles.Section}>
							<Text style={styles.Section__label}>Дни недели</Text>
							<View style={styles.WeekdayRow}>
								{WEEKDAYS.map((weekday) => {
									const isSelected = selectedWeekdays.includes(weekday.value)
									return (
										<Pressable
											key={weekday.value}
											style={[
												styles.WeekdayChip,
												isSelected && styles.WeekdayChip_active
											]}
											onPress={() => toggleWeekday(weekday.value)}
										>
											<Text
												style={[
													styles.WeekdayChip__label,
													isSelected && styles.WeekdayChip__label_active
												]}
											>
												{weekday.label}
											</Text>
										</Pressable>
									)
								})}
							</View>

							<Text style={styles.Section__label}>Время (необязательно)</Text>
							<TextInput
								style={styles.TimeInput}
								value={weeklyTime}
								onChangeText={setWeeklyTime}
								placeholder='Например 20:00'
								placeholderTextColor={theme.colors.minor}
								keyboardType='numbers-and-punctuation'
							/>
							<Text style={styles.Hint}>
								Можно оставить пустым — задача будет только привязана к дням
								недели.
							</Text>
						</View>
					)}

					{ruleType === 'daily' && (
						<View style={styles.Section}>
							<Text style={styles.Section__label}>
								Время через запятую (необязательно)
							</Text>
							<TextInput
								style={styles.TimeInput}
								value={dailyTimesText}
								onChangeText={setDailyTimesText}
								placeholder='Например: 09:00, 19:00'
								placeholderTextColor={theme.colors.minor}
							/>
						</View>
					)}

					{ruleType === 'once' && (
						<View style={styles.Section}>
							<Text style={styles.Section__label}>Дата (YYYY-MM-DD)</Text>
							<TextInput
								style={styles.TimeInput}
								value={onceDate}
								onChangeText={setOnceDate}
								placeholder='2026-04-01'
								placeholderTextColor={theme.colors.minor}
							/>
							<Text style={styles.Section__label}>Время (необязательно)</Text>
							<TextInput
								style={styles.TimeInput}
								value={onceTime}
								onChangeText={setOnceTime}
								placeholder='10:00'
								placeholderTextColor={theme.colors.minor}
							/>
						</View>
					)}

					<View style={styles.Actions}>
						<Button
							variant='secondary'
							style={{ flex: 1 }}
							onPress={() => sheetRef.current?.dismiss()}
						>
							Отмена
						</Button>
						<Button style={{ flex: 1 }} onPress={handleConfirm}>
							Готово
						</Button>
					</View>
				</View>
			</TrueSheet>
		)
	}
)

const styles = StyleSheet.create((theme, rt) => ({
	Content: {
		padding: STYLE_VARS.sidePadding,
		paddingBottom: STYLE_VARS.sidePadding + 24,
		gap: 16
	},
	Title: {
		fontSize: 18 * rt.fontScale,
		fontWeight: '600',
		color: theme.colors.major
	},
	TypeRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8
	},
	TypeChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: theme.colors.surface
	},
	TypeChip_active: {
		backgroundColor: theme.colors.primary
	},
	TypeChip__label: {
		fontSize: 14 * rt.fontScale,
		color: theme.colors.major
	},
	TypeChip__label_active: {
		color: '#fff'
	},
	Section: {
		gap: 8
	},
	Section__label: {
		fontSize: 13 * rt.fontScale,
		color: theme.colors.minor,
		fontWeight: '500'
	},
	WeekdayRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8
	},
	WeekdayChip: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.surface
	},
	WeekdayChip_active: {
		backgroundColor: theme.colors.primary
	},
	WeekdayChip__label: {
		fontSize: 13 * rt.fontScale,
		color: theme.colors.major
	},
	WeekdayChip__label_active: {
		color: '#fff'
	},
	TimeInput: {
		backgroundColor: theme.colors.surface,
		borderRadius: STYLE_VARS.radius_sm,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16 * rt.fontScale,
		color: theme.colors.major
	},
	Hint: {
		fontSize: 12 * rt.fontScale,
		color: theme.colors.minor
	},
	Actions: {
		flexDirection: 'row',
		gap: theme.spacing.sm,
		marginTop: 8
	}
}))
