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
				storage: createJSONStorage(() => zustandStorage)
			}
		)
	)
)
