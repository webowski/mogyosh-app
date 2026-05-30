import { format, isSameDay, isToday } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
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

import { useSettingsStore } from '@/services/settings/model/settingsStore'
import { getDateFnsLocale } from '@/shared/i18n/dateFnsLocale'
import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { capitalize } from '@/shared/lib/string'
import { getWeekStartDate } from '@/shared/lib/time'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { STYLE_VARS } from '@/shared/styles/common'

const BASE_SCREEN_WIDTH = Dimensions.get('window').width
const BASE_WEEK_WIDTH = BASE_SCREEN_WIDTH - STYLE_VARS.sidePadding * 2
const BASE_DAY_WIDTH = BASE_WEEK_WIDTH / 7 - 8
const SWIPE_THRESHOLD = BASE_DAY_WIDTH // WEEK_WIDTH * 0.25
const VELOCITY_THRESHOLD = 800
const SWIPE_END_DURATION = 240

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
	dayWidth: number
}

function Day({ day, dayWidth }: DayProps) {
	const selectedDate = useCalendarStore((state) => state.selectedDate)

	const isDaySelected = isSameDay(selectedDate, day.date)
	const isDayToday = isToday(day.date)

	return (
		<Pressable
			key={day.date.getTime()}
			onPress={() => {
				useCalendarStore.getState().setSelectedDate(day.date)
			}}
		>
			<View
				style={[
					styles.day(dayWidth),
					isDaySelected && styles.day_selected,
					isDayToday && !isDaySelected && styles.day_today
				]}
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
			</View>
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
	weekWidth: number
	dayWidth: number
}

const Week = ({
	weekData,
	index,
	swipeTranslationValue,
	weekWidth,
	dayWidth
}: WeekProps) => {
	const weekAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: (index - 2) * weekWidth + swipeTranslationValue.value }
		]
	}))

	return (
		<Animated.View style={[styles.week(weekWidth), weekAnimatedStyle]}>
			{weekData.daysList.map((day) => (
				<Day key={day.date.getTime()} day={day} dayWidth={dayWidth} />
			))}
		</Animated.View>
	)
}

type WeekData = {
	weekStartDate: Date
	daysList: ReturnType<typeof getWeekDays>
}

const isTodayWeek = (weekData: WeekData): boolean => {
	const weekStartDayIndex = useSettingsStore.getState().weekStartDayIndex
	const today = useCalendarStore.getState().today

	const currentWeekStartDate = getWeekStartDate(today, weekStartDayIndex)
	return isSameDay(weekData.weekStartDate, currentWeekStartDate)
}

function makeWeeksDataArray(): WeekData[] {
	const today = useCalendarStore.getState().today
	const weekStartDayIndex = useSettingsStore.getState().weekStartDayIndex

	const currentWeekStartDate = getWeekStartDate(today, weekStartDayIndex)

	return [-2, -1, 0, 1, 2].map((offset) => {
		const start = addDaysToDate(currentWeekStartDate, offset * 7)
		return {
			weekStartDate: start,
			daysList: getWeekDays(start, today)
		}
	})
}

export default function WeekCalendar() {
	const today = useCalendarStore((state) => state.today)
	const refreshTodayDate = useCalendarStore((state) => state.refreshTodayDate)

	const { width: windowWidth } = useWindowDimensions()

	const weekStartDayIndex = useSettingsStore((state) => state.weekStartDayIndex)
	const [weeksDataArray, setWeeksDataArray] = useState(makeWeeksDataArray())

	const swipeTranslationValue = useSharedValue(0)

	const { weekWidth, dayWidth } = useMemo(() => {
		const weekWidth = windowWidth - STYLE_VARS.sidePadding * 2
		const dayWidth = weekWidth / 7 - 8
		return { weekWidth, dayWidth }
	}, [windowWidth])

	useEffect(
		function effectOnWindowResize() {
			setWeeksDataArray(makeWeeksDataArray())
		},
		[windowWidth]
	)

	useEffect(
		function effectOnWeekStartChange() {
			setWeeksDataArray(makeWeeksDataArray())
		},
		[weekStartDayIndex]
	)

	useEffect(
		function effectOnWeekChange() {
			// сбрасываем смещение свайпа при смене недели
			swipeTranslationValue.value = 0

			// выбираем первый день текущей недели при смене недели
			const selectedWeek = weeksDataArray[2]
			// если неделя текущая
			if (isTodayWeek(selectedWeek)) {
				useCalendarStore.getState().setSelectedDate(today)
			} else {
				useCalendarStore.getState().setSelectedDate(selectedWeek.weekStartDate)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[weeksDataArray]
	)

	useLanguageChange(() => {
		setWeeksDataArray(makeWeeksDataArray())
	})

	const updateWeekList = (targetDelta: number) => {
		refreshTodayDate()

		setWeeksDataArray((currentList) => {
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

			const targetOffset = targetDelta * weekWidth

			swipeTranslationValue.value = withTiming(
				targetOffset,
				{ duration: SWIPE_END_DURATION, reduceMotion: ReduceMotion.Never },
				(finished) => {
					if (!finished || targetDelta === 0) return
					scheduleOnRN(updateWeekList, targetDelta)
				}
			)
		})

	return (
		<GestureDetector gesture={panGesture}>
			<View style={styles.container(weekWidth)}>
				{weeksDataArray.map((weekData, index) => (
					<Week
						key={weekData.weekStartDate.getTime()}
						weekData={weekData}
						index={index}
						swipeTranslationValue={swipeTranslationValue}
						weekWidth={weekWidth}
						dayWidth={dayWidth}
					/>
				))}
			</View>
		</GestureDetector>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: (weekWidth: number) => ({
		position: 'relative',
		width: weekWidth,
		height: 44,
		marginTop: 6,
		overflow: 'hidden'
	}),
	week: (weekWidth: number) => ({
		position: 'absolute',
		inset: 0,
		paddingInline: 4,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: weekWidth
	}),
	day: (dayWidth: number) => ({
		width: dayWidth,
		minWidth: 40,
		alignItems: 'center',
		paddingTop: 4,
		paddingBottom: 5,
		paddingHorizontal: 6,
		borderRadius: 7
	}),

	day_today: {
		backgroundColor: theme.colors.currentFill
	},
	todayText: {
		color: theme.colors.currentText
	},

	weekday: {
		fontSize: 11,
		lineHeight: 11 * 1,
		fontWeight: '500',
		color: theme.colors.mutedLightText,
		marginBottom: 3
	},
	dayNumber: {
		fontSize: 14,
		lineHeight: 14 * 1,
		fontWeight: '600',
		color: theme.colors.mutedLightText
	},

	day_selected: {
		backgroundColor: theme.colors.selectedFill,
		borderRadius: 7
	},
	selectedText: {
		color: theme.colors.selectedText
	}
}))
