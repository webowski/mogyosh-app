import { create } from 'zustand'

type UIState = {
	input: string
	setInput: (value: string) => void
	clearInput: () => void
}

export const useUIStore = create<UIState>((set) => ({
	input: '',
	setInput: (value) => set({ input: value }),
	clearInput: () => set({ input: '' })
}))
