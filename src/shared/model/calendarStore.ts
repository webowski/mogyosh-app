import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

import { createZustandStorage } from '@/shared/lib/mmkv'

const storage = createMMKV({ id: 'calendar-storage' })
const zustandStorage = createZustandStorage(storage)

interface CalendarStore {
	today: Date
	refreshTodayDate: () => void

	selectedDate: Date
	setSelectedDate: (date: Date) => void

	selectedMonth: Date
	setSelectedMonth: (date: Date) => void
}

export const useCalendarStore = create<CalendarStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				today: new Date(),
				refreshTodayDate: () => {
					set({ today: new Date() })
				},

				selectedDate: new Date(),
				setSelectedDate: (date: Date) => {
					set({ selectedDate: date })
				},

				selectedMonth: new Date(),
				setSelectedMonth: (date: Date) => {
					set({ selectedMonth: date })
				}
			}),
			{
				name: 'calendar-storage',
				storage: createJSONStorage(() => zustandStorage),
				partialize: (state) => ({
					selectedDate: state.selectedDate,
					selectedMonth: state.selectedMonth
				}),
				onRehydrateStorage: () => (state) => {
					if (state?.selectedDate) {
						state.selectedDate = new Date(state.selectedDate)
					}

					if (state?.selectedMonth) {
						state.selectedMonth = new Date(state.selectedMonth)
					}
				}
			}
		)
	)
)
