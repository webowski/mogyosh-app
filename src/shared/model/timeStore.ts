import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { enUS, es, ja, ru } from 'date-fns/locale'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { WeekStartDayIndex } from '@/shared/domain/time'
import i18n from '@/shared/i18n'
import { capitalize } from '@/shared/lib/string'

type WeekStartDaysData = { value: WeekStartDayIndex; label: string }[]

interface TimeStore {
	weekStartDayIndex: WeekStartDayIndex
	setWeekStartDayIndex: (date: WeekStartDayIndex) => void

	weekStartDaysData: WeekStartDaysData
	updateWeekStartDaysData: () => void

	selectedDate: Date
	setSelectedDate: (date: Date) => void
}

const getLocale = () => {
	switch (i18n.language) {
		case 'ru':
			return ru
		case 'en':
			return enUS
		case 'ja':
			return ja
		case 'es':
			return es
		default:
			return enUS
	}
}

const makeWeekStartDaysData = (): WeekStartDaysData => {
	const mon = format(new Date(2024, 4, 6), 'EEEEEE', { locale: getLocale() })
	const sun = format(new Date(2024, 4, 5), 'EEEEEE', { locale: getLocale() })
	// const mon = format(new Date(2024, 3, 6), 'EEEEEE', { locale: i18n.language })
	// const sun = format(new Date(2024, 3, 5), 'EEEEEE', { locale: i18n.language })

	return [
		{ value: 1, label: capitalize(mon) },
		{ value: 0, label: capitalize(sun) }
	]
}

export const useTimeStore = create<TimeStore>()(
	// subscribeWithSelector(
	persist(
		(set) => ({
			weekStartDayIndex: 1,
			setWeekStartDayIndex: (weekday) => {
				console.log(weekday)
				set({ weekStartDayIndex: weekday })
			},

			weekStartDaysData: makeWeekStartDaysData(),
			updateWeekStartDaysData: () => {
				const weekStartDaysData = makeWeekStartDaysData()
				set({ weekStartDaysData: weekStartDaysData })
			},

			selectedDate: new Date(),
			setSelectedDate: (date: Date) => {
				set({ selectedDate: date })
			}
		}),
		{
			name: 'time-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({ weekStartDayIndex: state.weekStartDayIndex })
			// onRehydrateStorage: () => (state) => {
			// 	if (state) changeLanguage(state.language)
			// }
		}
	)
	// )
)

i18n.on('languageChanged', () => {
	useTimeStore.getState().updateWeekStartDaysData()
})
