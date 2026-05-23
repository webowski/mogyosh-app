import { format, isSameDay, isSameMonth } from 'date-fns'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

import { useSettingsStore } from '@/services/settings/model/settingsStore'
import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'
import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { capitalize } from '@/shared/lib/string'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { STYLE_VARS } from '@/shared/styles/common'

const { width: BASE_WINDOW_WIDTH } = Dimensions.get('window')
const BASE_CALENDAR_WIDTH = BASE_WINDOW_WIDTH - STYLE_VARS.sidePadding * 2

const SWIPE_THRESHOLD = BASE_CALENDAR_WIDTH * 0.25
const VELOCITY_THRESHOLD = 800
const SWIPE_END_DURATION = 240

const WEEKS_PER_MONTH = 6

const addDaysToDate = (date: Date, days: number): Date => {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

const addMonthsToDate = (date: Date, months: number): Date => {
	const result = new Date(date)
	result.setMonth(result.getMonth() + months)
	return result
}

const getMonthStartDate = (date: Date): Date => {
	return new Date(date.getFullYear(), date.getMonth(), 1)
}

type DayCell = {
	date: Date
	dayNumber: number
	isCurrentMonth: boolean
	isToday: boolean
}

type MonthData = {
	monthDate: Date
	weeks: DayCell[][]
}

const getMonthData = (
	monthDate: Date,
	weekStartDayIndex: number,
	today: Date
): MonthData => {
	const monthStart = getMonthStartDate(monthDate)
	const monthStartDay = monthStart.getDay()

	// Сколько дней отступать назад от начала месяца
	const diff = (monthStartDay - weekStartDayIndex + 7) % 7
	const gridStart = addDaysToDate(monthStart, -diff)

	const totalDays = WEEKS_PER_MONTH * 7
	const allDays: DayCell[] = Array.from({ length: totalDays }, (_, i) => {
		const date = addDaysToDate(gridStart, i)
		return {
			date,
			dayNumber: date.getDate(),
			isCurrentMonth: isSameMonth(date, monthDate),
			isToday: isSameDay(date, today)
		}
	})

	const weeks: DayCell[][] = []
	for (let w = 0; w < WEEKS_PER_MONTH; w++) {
		weeks.push(allDays.slice(w * 7, w * 7 + 7))
	}

	return { monthDate, weeks }
}

const makeMonthsDataArray = (): MonthData[] => {
	const today = useCalendarStore.getState().today
	const weekStartDayIndex = useSettingsStore.getState().weekStartDayIndex
	const currentMonthDate = getMonthStartDate(today)

	return [-2, -1, 0, 1, 2].map((offset) => {
		const monthDate = addMonthsToDate(currentMonthDate, offset)
		return getMonthData(monthDate, weekStartDayIndex, today)
	})
}

export const isCurrentMonth = (monthData: MonthData): boolean => {
	const today = useCalendarStore.getState().today
	return isSameMonth(monthData.monthDate, today)
}

type WeekdayHeaderProps = {
	weekStartDayIndex: number
}

function WeekdayHeader({ weekStartDayIndex }: WeekdayHeaderProps) {
	const headers = useMemo(() => {
		const locale = getDateFnsLocale()
		return Array.from({ length: 7 }, (_, i) => {
			const dayIndex = (weekStartDayIndex + i) % 7
			// Берём любую дату с нужным днём недели
			const referenceDate = new Date(2024, 0, 7 + dayIndex) // 2024-01-07 = воскресенье
			return capitalize(format(referenceDate, 'EEEEEE', { locale }))
		})
	}, [weekStartDayIndex])

	return (
		<View style={styles.weekdayHeader}>
			{headers.map((label, index) => (
				<View key={index} style={styles.weekdayHeaderCell}>
					<Text style={styles.weekdayHeaderText}>{label}</Text>
				</View>
			))}
		</View>
	)
}

type DayCellProps = {
	cell: DayCell
}

const DayCellView = React.memo(function DayCellView({ cell }: DayCellProps) {
	const isDaySelected = useCalendarStore((state) =>
		isSameDay(state.selectedDate, cell.date)
	)

	const handlePress = useCallback(() => {
		useCalendarStore.getState().setSelectedDate(cell.date)
	}, [cell.date])

	return (
		<Pressable
			onPress={handlePress}
			style={[
				styles.day,
				isDaySelected && styles.day_selected,
				cell.isToday && !isDaySelected && styles.day_today
			]}
		>
			<Text
				style={[
					styles.dayNumber,
					!cell.isCurrentMonth && styles.dayNumber_otherMonth,
					isDaySelected && styles.selectedText,
					cell.isToday && !isDaySelected && styles.text_today
				]}
			>
				{cell.dayNumber}
			</Text>
			<Text
				style={[
					styles.day__counter,
					!cell.isCurrentMonth && styles.text_muted,
					isDaySelected && styles.selectedText,
					cell.isToday && !isDaySelected && styles.text_today
				]}
			>
				1/5
			</Text>
		</Pressable>
	)
})

type MonthProps = {
	monthData: MonthData
	index: number
	swipeTranslationValue: SharedValue<number>
	calendarWidth: number
	calendarHeight: number
}

const Month = React.memo(function Month({
	monthData,
	index,
	swipeTranslationValue,
	calendarWidth,
	calendarHeight
}: MonthProps) {
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: (index - 2) * calendarWidth + swipeTranslationValue.value }
		]
	}))

	return (
		<Animated.View style={[styles.month(calendarWidth), animatedStyle]}>
			{monthData.weeks.map((week, weekIndex) => (
				<View key={weekIndex} style={styles.week(calendarHeight)}>
					{week.map((cell) => (
						<DayCellView key={cell.date.getTime()} cell={cell} />
					))}
				</View>
			))}
		</Animated.View>
	)
})

export default function Calendar() {
	// const today = useCalendarStore((state) => state.today)
	const today = useCalendarStore.getState().today
	const [dimensions, setDimensions] = useState(() => Dimensions.get('window'))

	const weekStartDayIndex = useSettingsStore((state) => state.weekStartDayIndex)

	const [monthsDataArray, setMonthsDataArray] = useState(makeMonthsDataArray)

	const swipeTranslationValue = useSharedValue(0)

	useEffect(() => {
		const sub = Dimensions.addEventListener('change', ({ window }) => {
			setDimensions(window)
		})
		return () => sub.remove()
	}, [])

	const { calendarWidth, calendarHeight } = useMemo(() => {
		const calendarWidth = dimensions.width - STYLE_VARS.sidePadding_sm * 2
		let calendarHeight = dimensions.height - STYLE_VARS.sidePadding_sm * 2 - 200
		calendarHeight = calendarHeight > 560 ? 560 : calendarHeight

		return { calendarWidth, calendarHeight }
	}, [dimensions.width, dimensions.height])

	const isFirstRender = useRef(true)

	useEffect(
		function effectForMonthRebuild() {
			if (isFirstRender.current) {
				isFirstRender.current = false
				return
			}
			setMonthsDataArray(makeMonthsDataArray())
		},
		[dimensions.width, weekStartDayIndex]
	)

	useEffect(
		function effectOnMonthChange() {
			swipeTranslationValue.value = 0
			const selectedMonth = monthsDataArray[2]

			useCalendarStore.getState().setSelectedMonth(selectedMonth.monthDate)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[monthsDataArray]
	)

	useLanguageChange(() => {
		setMonthsDataArray(makeMonthsDataArray())
	})

	const updateMonthList = (targetDelta: number, today: Date) => {
		setMonthsDataArray((currentList) => {
			const weekStartDayIndex = useSettingsStore.getState().weekStartDayIndex
			const newList = [...currentList]

			if (targetDelta === -1) {
				newList.shift()
				const lastMonth = currentList[4].monthDate
				const newMonthDate = addMonthsToDate(lastMonth, 1)
				newList.push(getMonthData(newMonthDate, weekStartDayIndex, today))
			} else {
				newList.pop()
				const firstMonth = currentList[0].monthDate
				const newMonthDate = addMonthsToDate(firstMonth, -1)
				newList.unshift(getMonthData(newMonthDate, weekStartDayIndex, today))
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

			const targetOffset = targetDelta * calendarWidth

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
		<View>
			<WeekdayHeader weekStartDayIndex={weekStartDayIndex} />
			<GestureDetector gesture={panGesture}>
				<View style={styles.container(calendarWidth, calendarHeight)}>
					{monthsDataArray.map((monthData, index) => (
						<Month
							key={monthData.monthDate.getTime()}
							monthData={monthData}
							index={index}
							swipeTranslationValue={swipeTranslationValue}
							calendarWidth={calendarWidth}
							calendarHeight={calendarHeight}
						/>
					))}
				</View>
			</GestureDetector>
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	container: (calendarWidth: number, calendarHeight: number) => ({
		position: 'relative',
		width: calendarWidth,
		height: calendarHeight,
		overflow: 'hidden'
	}),
	calendarHeader: {
		paddingBottom: 10
	},
	calendarTitle: {
		fontSize: 15,
		fontWeight: '700',
		textAlign: 'center',
		color: theme.colors.major
	},
	weekdayHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 4,
		marginBottom: 2
	},
	weekdayHeaderCell: {
		flex: 1,
		height: 26,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 4,
		backgroundColor: theme.colors.muted800,
		borderRadius: 4
	},
	weekdayHeaderText: {
		fontSize: 12,
		lineHeight: 12,
		fontWeight: '600',
		color: theme.colors.minor500
	},

	month: (calendarWidth: number) => ({
		position: 'absolute',
		inset: 0,
		width: calendarWidth,
		gap: 4
	}),

	week: (calendarHeight: number) => ({
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		flex: 1,
		gap: 4
	}),

	day: {
		flex: 1,
		padding: 6,
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		borderRadius: 4,
		backgroundColor: theme.colors.surface
	},
	day_today: {
		backgroundColor: theme.colors.primary800
	},
	day_selected: {
		backgroundColor: theme.colors.primary500
	},

	dayNumber: {
		fontSize: 13 * rt.fontScale,
		lineHeight: 13 * rt.fontScale,
		fontWeight: '700',
		color: theme.colors.major
	},
	dayNumber_otherMonth: {
		color: theme.colors.muted700
	},

	day__counter: {
		alignSelf: 'flex-end',
		fontSize: 11 * rt.fontScale,
		lineHeight: 11 * rt.fontScale,
		fontWeight: '500',
		color: theme.colors.muted600,
		textAlign: 'center'
	},

	text_muted: {
		color: theme.colors.muted800
	},

	selectedText: {
		color: theme.colors.inverse
	},
	text_today: {
		color: theme.colors.primary500
	}
}))
