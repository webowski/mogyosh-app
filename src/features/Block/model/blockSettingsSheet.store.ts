import { create } from 'zustand'

interface BlockSettingsSheetStore {
	isOpen: boolean
	open: () => void
	close: () => void
}

export const useBlockSettingsSheetStore = create<BlockSettingsSheetStore>(
	(set) => ({
		isOpen: false,
		open: () => set({ isOpen: true }),
		close: () => set({ isOpen: false })
	})
)
