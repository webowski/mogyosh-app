import { create } from 'zustand'

interface TimeStore {
	selectedTask: unknown | null
	selectedDate: Date
	setSelectedDate: (date: Date) => void
}

export const useTimeStore = create<TimeStore>((set) => ({
	selectedTask: null,
	selectedDate: new Date(),
	setSelectedDate: (date: Date) => {
		set({ selectedDate: date })
	}
}))
