import { create } from 'zustand'

type TimePickerSheetPayload = {
	hours: number
	minutes: number
	title: string
	onChange: (hours: number, minutes: number) => void
}

interface TimePickerSheetStore {
	isOpen: boolean
	payload: TimePickerSheetPayload | null
	open: (payload: TimePickerSheetPayload) => void
	close: () => void
}

export const useTimePickerSheetStore = create<TimePickerSheetStore>((set) => ({
	isOpen: false,
	payload: null,
	open: (payload) => set({ isOpen: true, payload }),
	close: () => set({ isOpen: false, payload: null })
}))
