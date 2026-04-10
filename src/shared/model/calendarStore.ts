import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

interface CalendarStore {
	today: Date
	selectedDate: Date
	setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				today: new Date(),

				selectedDate: new Date(),
				setSelectedDate: (date: Date) => {
					set({ selectedDate: date })
				}
			}),
			{
				name: 'calendar-storage',
				storage: createJSONStorage(() => AsyncStorage)
			}
		)
	)
)
