import { format } from 'date-fns'
import { enUS, es, ja, ru } from 'date-fns/locale'
import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'

import i18n from '@/shared/i18n'
import { capitalize } from '@/shared/lib/string'
import { UnistylesRuntime } from 'react-native-unistyles'
import { SettingsStore, WeekStartDaysData } from '../domain'

const storage = createMMKV({ id: 'settings-storage' })

const zustandStorage: StateStorage = {
	setItem: (name, value) => storage.set(name, value),
	getItem: (name) => storage.getString(name) ?? null,
	removeItem: (name) => storage.remove(name)
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
			updateWeekStartDaysData: () =>
				set({ weekStartDaysData: makeWeekStartDaysData() }),

			currentTheme: 'light',
			setCurrentTheme: (theme) => {
				UnistylesRuntime.setTheme(theme)
				set({ currentTheme: theme })
			},

			hourFormat: '24',
			setHourFormat: (value) => set({ hourFormat: value })
		}),
		{
			name: 'settings-storage',
			storage: createJSONStorage(() => zustandStorage),
			onRehydrateStorage: () => (state) => {
				if (state?.currentTheme) {
					UnistylesRuntime.setTheme(state.currentTheme)
				}
			}
		}
	)
)

i18n.on('languageChanged', () => {
	useSettingsStore.getState().updateWeekStartDaysData()
})
