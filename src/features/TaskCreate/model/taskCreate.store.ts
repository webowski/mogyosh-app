import { create } from 'zustand'

interface TaskCreateStore {
	isOpen: boolean
	open: () => void
	close: () => void
}

export const useTaskCreateStore = create<TaskCreateStore>((set) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false })
}))
