import { create } from 'zustand'

import type { BlockId, TaskId } from '@/shared/domain/ids'

export type CounterValueField = 'value' | 'count'

type CounterValueSheetPayload = {
	blockId: BlockId
	taskId: TaskId
	field: CounterValueField
	title: string
	maxValue: number
}

interface CounterValueSheetStore {
	isOpen: boolean
	payload: CounterValueSheetPayload | null
	open: (payload: CounterValueSheetPayload) => void
	close: () => void
}

export const useCounterValueSheetStore = create<CounterValueSheetStore>(
	(set) => ({
		isOpen: false,
		payload: null,
		open: (payload) => set({ isOpen: true, payload }),
		close: () => set({ isOpen: false, payload: null })
	})
)
