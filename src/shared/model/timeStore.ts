import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { WeekStartDay } from '@/shared/domain/time'

interface TimeStore {
	weekStartDay: WeekStartDay
	setWeekStartDay: (date: WeekStartDay) => void

	weekStartDays: { value: WeekStartDay; label: string }[]

	selectedDate: Date
	setSelectedDate: (date: Date) => void
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

			weekStartDays: [
				{ value: 1, label: 'Пн' },
				{ value: 0, label: 'Вс' }
			],

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
