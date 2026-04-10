import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import { enUS, es, ja, ru } from 'date-fns/locale'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import i18n from '@/shared/i18n'
import { capitalize } from '@/shared/lib/string'
import { SettingsStore, WeekStartDaysData } from '../domain'

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

	return [
		{ value: 1, label: capitalize(mon) },
		{ value: 0, label: capitalize(sun) }
	]
}

export const useSettingsStore = create<SettingsStore>()(
	persist(
		(set) => ({
			weekStartDayIndex: 1,
			setWeekStartDayIndex: (value) => set({ weekStartDayIndex: value }),

			weekStartDaysData: makeWeekStartDaysData(),
			updateWeekStartDaysData: () => {
				const weekStartDaysData = makeWeekStartDaysData()
				set({ weekStartDaysData: weekStartDaysData })
			}
		}),
		{
			name: 'settings-storage',
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)

i18n.on('languageChanged', () => {
	useSettingsStore.getState().updateWeekStartDaysData()
})
