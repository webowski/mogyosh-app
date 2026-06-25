import type { RefObject } from 'react'
import { create } from 'zustand'

import type { SubitemId } from '@/shared/domain/ids'

type EditorToolbarStore = {
	focusedSubitemId: SubitemId | null
	setFocusedSubitemId: (id: SubitemId | null) => void
	pendingFocusId: RefObject<SubitemId | null>
}

export const useEditorToolbarStore = create<EditorToolbarStore>((set) => ({
	focusedSubitemId: null,
	setFocusedSubitemId: (id: SubitemId | null) => set({ focusedSubitemId: id }),

	pendingFocusId: { current: null }
}))
