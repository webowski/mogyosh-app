import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { WeekStartDay } from '@/shared/domain/time'
import i18n from '@/shared/i18n'
import { format } from 'date-fns'
import { enUS, es, ja, ru } from 'date-fns/locale'

type WeekStartDays = { value: WeekStartDay; label: string }[]

interface TimeStore {
	weekStartDay: WeekStartDay
	setWeekStartDay: (date: WeekStartDay) => void

	weekStartDays: WeekStartDays
	updateWeekStartDays: () => void

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

const buildWeekStartDays = (): WeekStartDays => {
	const mon = format(new Date(2024, 4, 6), 'EEEEEE', { locale: getLocale() })
	const sun = format(new Date(2024, 4, 5), 'EEEEEE', { locale: getLocale() })
	// const mon = format(new Date(2024, 3, 6), 'EEEEEE', { locale: i18n.language })
	// const sun = format(new Date(2024, 3, 5), 'EEEEEE', { locale: i18n.language })

	return [
		{ value: 1, label: mon },
		{ value: 0, label: sun }
	]
}

export const useTimeStore = create<TimeStore>()(
	// subscribeWithSelector(
	persist(
		(set) => ({
			weekStartDay: 1,
			setWeekStartDay: (weekday) => {
				console.log(weekday)
				set({ weekStartDay: weekday })
			},

			weekStartDays: buildWeekStartDays(),
			updateWeekStartDays: () => {
				const weekStartDays = buildWeekStartDays()
				set({ weekStartDays: weekStartDays })
			},

			selectedDate: new Date(),
			setSelectedDate: (date: Date) => {
				set({ selectedDate: date })
			}
		}),
		{
			name: 'time-storage',
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({ weekStartDay: state.weekStartDay })
			// onRehydrateStorage: () => (state) => {
			// 	if (state) changeLanguage(state.language)
			// }
		}
	)
	// )
)

i18n.on('languageChanged', () => {
	useTimeStore.getState().updateWeekStartDays()
})
