import type { RefObject } from 'react'
import { create } from 'zustand'

import type { BlockInputRefsMap } from '@/shared/domain/block'
import type { BlockId, ItemId } from '@/shared/domain/ids'

type EditorToolbarStore = {
	focusedBlockId: BlockId | null
	setFocusedBlockId: (id: BlockId | null) => void

	pendingFocusId: RefObject<BlockId | null>

	activeItemId: ItemId | null
	setActiveItemId: (taskId: ItemId | null) => void

	inputRefs: BlockInputRefsMap
}

export const useEditorToolbarStore = create<EditorToolbarStore>((set) => ({
	focusedBlockId: null,
	setFocusedBlockId: (id: BlockId | null) => set({ focusedBlockId: id }),

	pendingFocusId: { current: null },

	activeItemId: null,
	setActiveItemId: (taskId: ItemId | null) => set({ activeItemId: taskId }),

	inputRefs: new Map()
}))
