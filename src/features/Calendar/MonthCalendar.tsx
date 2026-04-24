import React, { useEffect, useMemo, useState } from 'react'
import {
	Dimensions,
	Pressable,
	Text,
	useWindowDimensions,
	View
} from 'react-native'

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

import { addMonths, format, isSameDay, isSameMonth, isToday } from 'date-fns'

import { useSettingsStore } from '@/services/settings/model/settingsStore'
import { WeekStartDayIndex } from '@/shared/domain/time'
import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'
import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { capitalize } from '@/shared/lib/string'
import { getWeekStartDate } from '@/shared/lib/time'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { styleVars } from '@/shared/styles/common'
import { Squircle } from '@/shared/ui/Squircle'

const BASE_SCREEN_WIDTH = Dimensions.get('window').width
const BASE_MONTH_WIDTH = BASE_SCREEN_WIDTH - styleVars.sidePadding * 2
const BASE_DAY_WIDTH = BASE_MONTH_WIDTH / 7 - 8
const SWIPE_THRESHOLD = BASE_DAY_WIDTH
const VELOCITY_THRESHOLD = 800
const SWIPE_END_DURATION = 240

const addDaysToDate = (date: Date, days: number): Date => {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

const getMonthDays = (
	monthDate: Date,
	today: Date,
	weekStartDayIndex: WeekStartDayIndex
) => {
	const year = monthDate.getFullYear()
	const month = monthDate.getMonth()

	const firstDayOfMonth = new Date(year, month, 1)
	const lastDayOfMonth = new Date(year, month + 1, 0)

	const firstWeekStartDate = getWeekStartDate(
		firstDayOfMonth,
		weekStartDayIndex
	)

	const days: {
		date: Date
		dayNumber: number
		weekday: string
		isToday: boolean
		isCurrentMonth: boolean
	}[] = []

	for (let i = 0; i < 42; i++) {
		const dayDate = addDaysToDate(firstWeekStartDate, i)
		const isCurrentMonth = isSameMonth(dayDate, monthDate)

		days.push({
			date: dayDate,
			dayNumber: dayDate.getDate(),
			weekday: capitalize(
				format(dayDate, 'EEEEEE', { locale: getDateFnsLocale() })
			),
			isToday: isToday(dayDate),
			isCurrentMonth
		})
	}

	return days
}

type DayProps = {
	day: ReturnType<typeof getMonthDays>[number]
	dayWidth: number
}

function Day({ day, dayWidth }: DayProps) {
	const selectedDate = useCalendarStore((state) => state.selectedDate)

	const isDaySelected = isSameDay(selectedDate, day.date)
	const isDayToday = isToday(day.date)
	const isCurrentMonth = day.isCurrentMonth

	return (
		<Pressable
			key={day.date.getTime()}
			onPress={() => {
				useCalendarStore.getState().setSelectedDate(day.date)
			}}
		>
			<Squircle
				style={[
					styles.day(dayWidth),
					isDaySelected && styles.day_selected,
					isDayToday && !isDaySelected && styles.day_today,
					!isCurrentMonth && styles.day_other_month
				]}
				cornerSmoothing={0.6}
			>
				<Text
					style={[
						styles.dayNumber,
						isDaySelected && styles.selectedText,
						isDayToday && !isDaySelected && styles.todayText,
						!isCurrentMonth && styles.otherMonthText
					]}
				>
					{day.dayNumber}
				</Text>
			</Squircle>
		</Pressable>
	)
}

type MonthProps = {
	monthData: {
		monthDate: Date
		daysList: ReturnType<typeof getMonthDays>
	}
	index: number
	swipeTranslationValue: SharedValue<number>
	monthWidth: number
	dayWidth: number
}

const Month = ({
	monthData,
	index,
	swipeTranslationValue,
	monthWidth,
	dayWidth
}: MonthProps) => {
	const monthAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: (index - 2) * monthWidth + swipeTranslationValue.value }
		]
	}))

	return (
		<Animated.View style={[styles.month(monthWidth), monthAnimatedStyle]}>
			<View style={styles.monthGrid}>
				{monthData.daysList.map((day) => (
					<Day key={day.date.getTime()} day={day} dayWidth={dayWidth} />
				))}
			</View>
		</Animated.View>
	)
}

type MonthData = {
	monthDate: Date
	daysList: ReturnType<typeof getMonthDays>
}

const isCurrentMonth = (monthData: MonthData): boolean => {
	const today = useCalendarStore.getState().today
	return isSameMonth(monthData.monthDate, today)
}

function makeMonthsDataArray(): MonthData[] {
	const today = useCalendarStore.getState().today
	const weekStartDayIndex = useSettingsStore.getState().weekStartDayIndex

	const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1)

	return [-2, -1, 0, 1, 2].map((offset) => {
		const monthDate = addMonths(currentMonthDate, offset)
		return {
			monthDate: monthDate,
			daysList: getMonthDays(monthDate, today, weekStartDayIndex)
		}
	})
}

export default function MonthCalendar() {
	const today = useCalendarStore((state) => state.today)
	const { width: windowWidth } = useWindowDimensions()

	const weekStartDayIndex = useSettingsStore((state) => state.weekStartDayIndex)
	const [monthsDataArray, setMonthsDataArray] = useState(makeMonthsDataArray)

	const swipeTranslationValue = useSharedValue(0)

	const { monthWidth, dayWidth } = useMemo(() => {
		const monthWidth = windowWidth - styleVars.sidePadding * 2
		const dayWidth = monthWidth / 7 - 8
		return { monthWidth, dayWidth }
	}, [windowWidth])

	useEffect(
		function effectOnWindowResize() {
			setMonthsDataArray(makeMonthsDataArray())
		},
		[windowWidth]
	)

	useEffect(
		function effectOnWeekStartChange() {
			setMonthsDataArray(makeMonthsDataArray())
		},
		[weekStartDayIndex]
	)

	useEffect(
		function effectOnMonthChange() {
			swipeTranslationValue.value = 0

			const selectedMonth = monthsDataArray[2]
			if (isCurrentMonth(selectedMonth)) {
				useCalendarStore.getState().setSelectedDate(today)
			} else {
				const firstDayOfMonth = new Date(
					selectedMonth.monthDate.getFullYear(),
					selectedMonth.monthDate.getMonth(),
					1
				)
				useCalendarStore.getState().setSelectedDate(firstDayOfMonth)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[monthsDataArray, today]
	)

	useLanguageChange(() => {
		setMonthsDataArray(makeMonthsDataArray())
	})

	const updateMonthList = (targetDelta: number, today: Date) => {
		const weekStartDayIndex = useSettingsStore.getState().weekStartDayIndex

		setMonthsDataArray((currentList) => {
			const newList = [...currentList]

			if (targetDelta === -1) {
				newList.shift()
				const lastMonth = currentList[4].monthDate
				const newMonth = addMonths(lastMonth, 1)
				newList.push({
					monthDate: newMonth,
					daysList: getMonthDays(newMonth, today, weekStartDayIndex)
				})
			} else {
				newList.pop()
				const firstMonth = currentList[0].monthDate
				const newMonth = addMonths(firstMonth, -1)
				newList.unshift({
					monthDate: newMonth,
					daysList: getMonthDays(newMonth, today, weekStartDayIndex)
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

			const targetOffset = targetDelta * monthWidth

			swipeTranslationValue.value = withTiming(
				targetOffset,
				{ duration: SWIPE_END_DURATION, reduceMotion: ReduceMotion.Never },
				(finished) => {
					if (!finished || targetDelta === 0) return

					scheduleOnRN(updateMonthList, targetDelta, today)
				}
			)
		})

	return (
		<GestureDetector gesture={panGesture}>
			<View style={styles.container(monthWidth)}>
				{monthsDataArray.map((monthData, index) => (
					<Month
						key={monthData.monthDate.getTime()}
						monthData={monthData}
						index={index}
						swipeTranslationValue={swipeTranslationValue}
						monthWidth={monthWidth}
						dayWidth={dayWidth}
					/>
				))}
			</View>
		</GestureDetector>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: (monthWidth: number) => ({
		position: 'relative',
		width: monthWidth,
		height: 294,
		marginTop: 6,
		overflow: 'hidden'
	}),
	month: (monthWidth: number) => ({
		position: 'absolute',
		inset: 0,
		paddingInline: 4,
		width: monthWidth
	}),
	monthGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		rowGap: 8
	},
	day: (dayWidth: number) => ({
		width: dayWidth,
		minWidth: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 7
	}),
	day_today: {
		backgroundColor: theme.colors.primary800
	},
	day_selected: {
		backgroundColor: theme.colors.primary
	},
	day_other_month: {
		opacity: 0.4
	},
	dayNumber: {
		fontSize: 14,
		lineHeight: 14 * 1,
		fontWeight: '600',
		color: theme.colors.muted
	},
	selectedText: {
		color: theme.colors.inverse
	},
	todayText: {
		color: theme.colors.primary
	},
	otherMonthText: {
		color: theme.colors.muted
	}
}))
