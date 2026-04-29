import { UnistylesThemes } from 'react-native-unistyles'

import { HourFormat } from '@/shared/domain/time'

export type WeekStartDayIndex = 1 | 0

export type WeekStartDaysData = {
	value: WeekStartDayIndex
	label: string
}[]

export interface SettingsStore {
	weekStartDayIndex: WeekStartDayIndex
	setWeekStartDayIndex: (value: WeekStartDayIndex) => void

	weekStartDaysData: WeekStartDaysData
	updateWeekStartDaysData: () => void

	currentTheme: keyof UnistylesThemes
	setCurrentTheme: (theme: keyof UnistylesThemes) => void

	hourFormat: HourFormat
	setHourFormat: (value: HourFormat) => void
}
