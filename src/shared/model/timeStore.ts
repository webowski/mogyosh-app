import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface TimeStore {
	selectedDate: Date
	setSelectedDate: (date: Date) => void
}

export const useTimeStore = create<TimeStore>()(
	persist(
		(set) => ({
			selectedDate: new Date(),
			setSelectedDate: (date: Date) => {
				set({ selectedDate: date })
			}
		}),
		{
			name: 'time-storage',
			storage: createJSONStorage(() => AsyncStorage)
		}
	)
)
