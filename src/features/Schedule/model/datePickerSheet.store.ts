import { create } from 'zustand'

type DatePickerSheetPayload = {
	date: string
	title: string
	onChange: (date: string) => void
}

interface DatePickerSheetStore {
	isOpen: boolean
	payload: DatePickerSheetPayload | null
	open: (payload: DatePickerSheetPayload) => void
	close: () => void
}

export const useDatePickerSheetStore = create<DatePickerSheetStore>((set) => ({
	isOpen: false,
	payload: null,
	open: (payload) => set({ isOpen: true, payload }),
	close: () => set({ isOpen: false, payload: null })
}))
