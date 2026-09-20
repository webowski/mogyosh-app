import { create } from 'zustand'

import type { BlockId, TaskId } from '@/shared/domain/ids'

type UnitSheetPayload = {
	blockId: BlockId
	taskId: TaskId
}

interface UnitSheetStore {
	isOpen: boolean
	payload: UnitSheetPayload | null
	open: (payload: UnitSheetPayload) => void
	close: () => void
}

export const useUnitSheetStore = create<UnitSheetStore>((set) => ({
	isOpen: false,
	payload: null,
	open: (payload) => set({ isOpen: true, payload }),
	close: () => set({ isOpen: false, payload: null })
}))
