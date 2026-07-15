import type { RefObject } from 'react'
import { create } from 'zustand'

import type { BlockMoveDirection } from '@/features/Block/model/block.store'
import type { BlockEntity, BlockInputRefsMap } from '@/shared/domain/block'
import type { BlockId, ItemId } from '@/shared/domain/ids'

export type UndoAction =
	| { type: 'remove'; removedBlock: BlockEntity; afterId: BlockId | null }
	| { type: 'update'; id: BlockId; previousPatch: Partial<BlockEntity> }
	| { type: 'move'; id: BlockId; direction: BlockMoveDirection }

type EditorToolbarStore = {
	focusedBlockId: BlockId | null
	setFocusedBlockId: (id: BlockId | null) => void

	pendingFocusId: RefObject<BlockId | null>

	activeItemId: ItemId | null
	setActiveItemId: (taskId: ItemId | null) => void

	inputRefs: BlockInputRefsMap

	undoStack: UndoAction[]
	pushUndoAction: (action: UndoAction) => void
	popUndoAction: () => UndoAction | undefined
}

export const useEditorToolbarStore = create<EditorToolbarStore>((set, get) => ({
	focusedBlockId: null,
	setFocusedBlockId: (id: BlockId | null) => set({ focusedBlockId: id }),

	pendingFocusId: { current: null },

	activeItemId: null,
	setActiveItemId: (taskId: ItemId | null) => set({ activeItemId: taskId }),

	inputRefs: new Map(),

	undoStack: [],
	pushUndoAction: (action) =>
		set((state) => ({ undoStack: [...state.undoStack, action] })),
	popUndoAction: () => {
		const stack = get().undoStack
		if (stack.length === 0) return undefined
		const lastAction = stack[stack.length - 1]
		set({ undoStack: stack.slice(0, -1) })
		return lastAction
	}
}))
