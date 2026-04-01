import React, { useEffect, useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'

import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	ReduceMotion,
	SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'

import { format, isSameDay, isToday } from 'date-fns'

import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'
import { capitalize } from '@/shared/lib/string'
import { Squircle } from '@/shared/ui/Squircle'
import { useLanguageChange } from '../i18n/useLanguageChange'

const SCREEN_WIDTH = Dimensions.get('window').width
const WEEK_WIDTH = SCREEN_WIDTH - 48
const DAY_WIDTH = WEEK_WIDTH / 7 - 8
const SWIPE_THRESHOLD = DAY_WIDTH // WEEK_WIDTH * 0.25
const VELOCITY_THRESHOLD = 800
const SWIPE_END_DURATION = 240

const getMondayOfWeek = (date: Date): Date => {
	const result = new Date(date)
	result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
	return result
}

const addDaysToDate = (date: Date, days: number): Date => {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

const getWeekDays = (weekStart: Date, today: Date) => {
	return Array.from({ length: 7 }, (_, i) => {
		const dayDate = addDaysToDate(weekStart, i)
		return {
			date: dayDate,
			dayNumber: dayDate.getDate(),
			weekday: capitalize(
				format(dayDate, 'EEEEEE', { locale: getDateFnsLocale() })
			),
			isToday: isSameDay(dayDate, today)
		}
	})
}

type DayProps = {
	day: ReturnType<typeof getWeekDays>[number]
	selectedDate: Date
	onSelectDate?: (d: Date) => void
}

function Day({ day, selectedDate, onSelectDate }: DayProps) {
	const isDaySelected = isSameDay(selectedDate, day.date)
	const isDayToday = isToday(day.date)

	return (
		<Pressable
			key={day.date.getTime()}
			onPress={() => {
				onSelectDate?.(day.date)
			}}
		>
			<Squircle
				// style={styles.day}
				style={[
					styles.day,
					isDaySelected && styles.day_selected,
					isDayToday && !isDaySelected && styles.day_today
				]}
				cornerSmoothing={0.6}
			>
				<Text
					style={[
						styles.weekday,
						isDaySelected && styles.selectedText,
						isDayToday && !isDaySelected && styles.todayText
					]}
				>
					{day.weekday}
				</Text>

				<Text
					style={[
						styles.dayNumber,
						isDaySelected && styles.selectedText,
						isDayToday && !isDaySelected && styles.todayText
					]}
				>
					{day.dayNumber}
				</Text>
			</Squircle>
		</Pressable>
	)
}

type WeekProps = {
	weekData: {
		weekStartDate: Date
		daysList: ReturnType<typeof getWeekDays>
	}
	index: number
	swipeTranslationValue: SharedValue<number>
	selectedDate: Date
	onSelectDate?: (d: Date) => void
}

const Week = ({
	weekData,
	index,
	swipeTranslationValue,
	selectedDate,
	onSelectDate
}: WeekProps) => {
	const weekAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: (index - 2) * WEEK_WIDTH + swipeTranslationValue.value }
		]
	}))

	return (
		<Animated.View style={[styles.week, weekAnimatedStyle]}>
			{weekData.daysList.map((day) => (
				<Day
					key={day.date.getTime()}
					day={day}
					selectedDate={selectedDate}
					onSelectDate={onSelectDate}
				/>
			))}
		</Animated.View>
	)
}

type WeekCalendarProps = {
	selectedDate?: Date
	onSelectDate?: (date: Date) => void
}

export default function WeekCalendar({
	selectedDate,
	onSelectDate
}: WeekCalendarProps) {
	const today = new Date()
	const currentSelectedDate = selectedDate ?? today
	const currentWeekStart = getMondayOfWeek(today)

	const buildInitialList = () =>
		[-2, -1, 0, 1, 2].map((offset) => {
			const start = addDaysToDate(currentWeekStart, offset * 7)
			return {
				weekStartDate: start,
				daysList: getWeekDays(start, today)
			}
		})

	const [weekDataList, setWeekDataList] = useState(buildInitialList())

	const swipeTranslationValue = useSharedValue(0)

	useEffect(() => {
		swipeTranslationValue.value = 0
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [weekDataList])

	useLanguageChange(() => {
		setWeekDataList(buildInitialList())
	})

	const updateWeekList = (targetDelta: number, today: Date) => {
		setWeekDataList((currentList) => {
			const newList = [...currentList]

			if (targetDelta === -1) {
				newList.shift()
				const lastStart = currentList[4].weekStartDate
				const newStart = addDaysToDate(lastStart, 7)
				newList.push({
					weekStartDate: newStart,
					daysList: getWeekDays(newStart, today)
				})
			} else {
				newList.pop()
				const firstStart = currentList[0].weekStartDate
				const newStart = addDaysToDate(firstStart, -7)
				newList.unshift({
					weekStartDate: newStart,
					daysList: getWeekDays(newStart, today)
				})
			}

			return newList
		})
	}

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			swipeTranslationValue.value = event.translationX
		})
		.onEnd((event) => {
			const translation = event.translationX
			const velocity = event.velocityX
			let targetDelta = 0

			if (
				Math.abs(translation) > SWIPE_THRESHOLD ||
				Math.abs(velocity) > VELOCITY_THRESHOLD
			) {
				targetDelta = translation > 0 ? 1 : -1
			}

			const targetOffset = targetDelta * WEEK_WIDTH

			swipeTranslationValue.value = withTiming(
				targetOffset,
				{ duration: SWIPE_END_DURATION, reduceMotion: ReduceMotion.Never },
				(finished) => {
					if (!finished || targetDelta === 0) return

					scheduleOnRN(updateWeekList, targetDelta, today)
				}
			)
		})

	return (
		<GestureDetector gesture={panGesture}>
			<View style={styles.container}>
				{weekDataList.map((weekData, index) => (
					<Week
						key={weekData.weekStartDate.getTime()}
						weekData={weekData}
						index={index}
						swipeTranslationValue={swipeTranslationValue}
						selectedDate={currentSelectedDate}
						onSelectDate={onSelectDate}
					/>
				))}
			</View>
		</GestureDetector>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		position: 'relative',
		width: WEEK_WIDTH,
		// height: 68,
		height: 44,
		marginTop: 12,
		overflow: 'hidden'
	},
	week: {
		position: 'absolute',
		inset: 0,
		paddingInline: 4,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	day: {
		width: DAY_WIDTH,
		minWidth: 40,
		alignItems: 'center',
		paddingVertical: 4,
		paddingBottom: 5,
		paddingHorizontal: 6,
		borderRadius: 7
	},
	day_selected: {
		backgroundColor: theme.colors.primary
	},
	day_today: {
		backgroundColor: theme.colors.primary800
	},
	weekday: {
		fontSize: 11,
		lineHeight: 11 * 1,
		fontWeight: '500',
		color: theme.colors.minor,
		marginBottom: 2
	},
	dayNumber: {
		fontSize: 14,
		lineHeight: 14 * 1,
		fontWeight: '600',
		color: theme.colors.major
	},
	selectedText: {
		color: theme.colors.inverse
	},
	todayText: {
		color: theme.colors.primary
	}
}))
