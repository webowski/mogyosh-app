import type { RefObject } from 'react'
import { create } from 'zustand'

import type { ItemId, SubitemId } from '@/shared/domain/ids'

type EditorToolbarStore = {
	focusedSubitemId: SubitemId | null
	setFocusedSubitemId: (id: SubitemId | null) => void

	pendingFocusId: RefObject<SubitemId | null>

	activeItemId: ItemId | null
	setActiveItemId: (taskId: ItemId | null) => void
}

export const useEditorToolbarStore = create<EditorToolbarStore>((set) => ({
	focusedSubitemId: null,
	setFocusedSubitemId: (id: SubitemId | null) => set({ focusedSubitemId: id }),

	pendingFocusId: { current: null },

	activeItemId: null,
	setActiveItemId: (taskId: ItemId | null) => set({ activeItemId: taskId })
}))
