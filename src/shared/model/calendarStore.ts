import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CalendarStore {
	selectedDate: Date
	setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarStore>()(
	persist(
		(set) => ({
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
