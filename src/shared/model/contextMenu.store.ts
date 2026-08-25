import { create } from 'zustand'

export type ContextMenuItem = {
	title: string
	onPress: () => void
	destructive?: boolean
}

type ContextMenuPosition = {
	x: number
	y: number
}

type ContextMenuStore = {
	isOpen: boolean
	position: ContextMenuPosition
	items: ContextMenuItem[]
	openContextMenu: (
		position: ContextMenuPosition,
		items: ContextMenuItem[]
	) => void
	closeContextMenu: () => void
}

export const useContextMenuStore = create<ContextMenuStore>((set) => ({
	isOpen: false,
	position: { x: 0, y: 0 },
	items: [],
	openContextMenu: (position, items) => set({ isOpen: true, position, items }),
	closeContextMenu: () => set({ isOpen: false })
}))
