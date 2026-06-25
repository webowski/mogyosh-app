import { create } from 'zustand'

import type { SubitemId } from '@/shared/domain/ids'

type EditorToolbarStore = {
	focusedSubitemId: SubitemId | null
	handleRemove: () => void
	handleAddSubitem: () => void
}

export const useEditorToolbarStore = create<EditorToolbarStore>((set) => ({
	focusedSubitemId: null,
	setFocusedSubitemId: (id: SubitemId | null) => set({ focusedSubitemId: id }),

	handleRemove: () => {
		// удаляем subitem c focusedSubitemId
	},
	handleAddSubitem: () => {
		// добавляем subitem
	}
}))
