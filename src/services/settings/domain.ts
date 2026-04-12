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

	currentTheme: string
	setCurrentTheme: (theme: string) => void
}
