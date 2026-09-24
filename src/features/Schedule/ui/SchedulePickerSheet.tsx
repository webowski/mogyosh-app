import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type {
	ScheduleData,
	ScheduleNotification,
	ScheduleRule
} from '@/shared/domain/task'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import { useTimePickerSheetStore } from '../model/timePickerSheet.store'

const WEEKDAYS = [
	{ value: 1, label: 'Пн' },
	{ value: 2, label: 'Вт' },
	{ value: 3, label: 'Ср' },
	{ value: 4, label: 'Чт' },
	{ value: 5, label: 'Пт' },
	{ value: 6, label: 'Сб' },
	{ value: 0, label: 'Вс' }
] as const

const NOTIFICATION_OPTIONS = [
	{ value: null, label: 'Нет' },
	{ value: 5, label: 'За 5 мин' },
	{ value: 15, label: 'За 15 мин' },
	{ value: 30, label: 'За 30 мин' },
	{ value: 60, label: 'За 1 час' },
	{ value: 1440, label: 'За 1 день' }
] as const

const parseTimeString = (
	timeString: string
): { hours: number; minutes: number } => {
	const match = timeString.trim().match(/^(\d{1,2}):(\d{2})$/)
	if (!match) {
		return { hours: 9, minutes: 0 }
	}
	const hours = Math.min(23, Math.max(0, Number(match[1])))
	const minutes = Math.min(59, Math.max(0, Number(match[2])))
	return { hours, minutes }
}

const formatTimeString = (hours: number, minutes: number): string => {
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

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
		const openTimePicker = useTimePickerSheetStore((state) => state.open)

		const [ruleType, setRuleType] = useState<RuleType | 'none'>('none')
		const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([
			1, 3, 5
		])
		const [weeklyTime, setWeeklyTime] = useState('') // was '20:00'
		const [dailyTimesText, setDailyTimesText] = useState('') // was '09:00, 19:00'
		const [onceDate, setOnceDate] = useState('')
		const [onceTime, setOnceTime] = useState('')
		const [notificationMinutesBefore, setNotificationMinutesBefore] = useState<
			number | null
		>(null)
		const [notifyAtStart, setNotifyAtStart] = useState(false)

		const resetFromData = (data?: ScheduleData | null) => {
			if (!data) {
				setRuleType('none')
				setSelectedWeekdays([1, 3, 5])
				setWeeklyTime('20:00')
				setDailyTimesText('09:00, 19:00')
				setOnceDate('')
				setOnceTime('')
				setNotificationMinutesBefore(null)
				setNotifyAtStart(false)
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

			const notification = data.notification
			setNotificationMinutesBefore(notification?.minutesBefore ?? null)
			setNotifyAtStart(notification?.notifyAtStart ?? false)
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

		const hasConcreteTime = (): boolean => {
			if (ruleType === 'weekly') {
				return weeklyTime.trim().length > 0
			}
			if (ruleType === 'daily') {
				return parseTimes(dailyTimesText).length > 0
			}
			if (ruleType === 'once') {
				return onceTime.trim().length > 0
			}
			return false
		}

		const openWeeklyTimePicker = () => {
			const { hours, minutes } = parseTimeString(weeklyTime.trim() || '20:00')
			openTimePicker({
				hours,
				minutes,
				title: 'Время',
				onChange: (nextHours, nextMinutes) => {
					setWeeklyTime(formatTimeString(nextHours, nextMinutes))
				}
			})
		}

		const openDailyTimePicker = () => {
			const firstParsed = parseTimes(dailyTimesText)[0]
			const fallback = dailyTimesText.trim() || '09:00'
			const { hours, minutes } = parseTimeString(firstParsed ?? fallback)
			openTimePicker({
				hours,
				minutes,
				title: 'Время',
				onChange: (nextHours, nextMinutes) => {
					setDailyTimesText(formatTimeString(nextHours, nextMinutes))
				}
			})
		}

		const openOnceTimePicker = () => {
			const { hours, minutes } = parseTimeString(onceTime.trim() || '10:00')
			openTimePicker({
				hours,
				minutes,
				title: 'Время',
				onChange: (nextHours, nextMinutes) => {
					setOnceTime(formatTimeString(nextHours, nextMinutes))
				}
			})
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

			let notification: ScheduleNotification | null = null

			if (hasConcreteTime()) {
				const hasAdvance =
					notificationMinutesBefore !== null && notificationMinutesBefore > 0
				const hasAtStart = notifyAtStart

				if (hasAdvance || hasAtStart) {
					notification = {
						minutesBefore: hasAdvance ? notificationMinutesBefore : null,
						notifyAtStart: hasAtStart
					}
				}
			}

			onConfirm({ rule, exceptions: [], notification })
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
							<Pressable
								style={styles.TimeField}
								onPress={openWeeklyTimePicker}
							>
								<Text
									style={[
										styles.TimeField__value,
										!weeklyTime.trim() && styles.TimeField__placeholder
									]}
								>
									{weeklyTime.trim() || 'Выбрать время'}
								</Text>
							</Pressable>
							<Text style={styles.Hint}>
								Можно оставить пустым — задача будет только привязана к дням
								недели.
							</Text>
						</View>
					)}

					{ruleType === 'daily' && (
						<View style={styles.Section}>
							<Text style={styles.Section__label}>Время (необязательно)</Text>
							<Pressable style={styles.TimeField} onPress={openDailyTimePicker}>
								<Text
									style={[
										styles.TimeField__value,
										!dailyTimesText.trim() && styles.TimeField__placeholder
									]}
								>
									{dailyTimesText.trim() || 'Выбрать время'}
								</Text>
							</Pressable>
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
							<Pressable style={styles.TimeField} onPress={openOnceTimePicker}>
								<Text
									style={[
										styles.TimeField__value,
										!onceTime.trim() && styles.TimeField__placeholder
									]}
								>
									{onceTime.trim() || 'Выбрать время'}
								</Text>
							</Pressable>
						</View>
					)}

					{hasConcreteTime() && (
						<View style={styles.Section}>
							<Text style={styles.Section__label}>Уведомление</Text>
							<View style={styles.TypeRow}>
								{NOTIFICATION_OPTIONS.map((option) => {
									const isSelected = notificationMinutesBefore === option.value
									return (
										<Pressable
											key={String(option.value)}
											style={[
												styles.TypeChip,
												isSelected && styles.TypeChip_active
											]}
											onPress={() => setNotificationMinutesBefore(option.value)}
										>
											<Text
												style={[
													styles.TypeChip__label,
													isSelected && styles.TypeChip__label_active
												]}
											>
												{option.label}
											</Text>
										</Pressable>
									)
								})}
							</View>

							<Pressable
								style={styles.CheckboxRow}
								onPress={() => setNotifyAtStart((current) => !current)}
							>
								<View
									style={[
										styles.Checkbox,
										notifyAtStart && styles.Checkbox_checked
									]}
								>
									{notifyAtStart && (
										<Text style={styles.Checkbox__mark}>✓</Text>
									)}
								</View>
								<Text style={styles.CheckboxRow__label}>
									В момент начала задачи
								</Text>
							</Pressable>
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
	TimeField: {
		backgroundColor: theme.colors.surface,
		borderRadius: STYLE_VARS.radius_sm,
		paddingHorizontal: 12,
		paddingVertical: 12
	},
	TimeField__value: {
		fontSize: 16 * rt.fontScale,
		color: theme.colors.major
	},
	TimeField__placeholder: {
		color: theme.colors.minor
	},
	Hint: {
		fontSize: 12 * rt.fontScale,
		color: theme.colors.minor
	},
	Actions: {
		flexDirection: 'row',
		gap: theme.spacing.sm,
		marginTop: 8
	},

	CheckboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 4
	},
	Checkbox: {
		width: 22,
		height: 22,
		borderRadius: 6,
		borderWidth: 1.5,
		borderColor: theme.colors.minor,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.surface
	},
	Checkbox_checked: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary
	},
	Checkbox__mark: {
		color: '#fff',
		fontSize: 14 * rt.fontScale,
		fontWeight: '700',
		lineHeight: 16 * rt.fontScale
	},
	CheckboxRow__label: {
		fontSize: 14 * rt.fontScale,
		color: theme.colors.major
	}
}))
