import { makeMutable } from 'react-native-reanimated'

import type { DragSortFlatEntry, DragSortId } from './dragSort.types'

// Runtime-only drag-n-drop state shared between JS and UI thread.
// Not a Zustand store — plain Reanimated mutables, one instance per
// DragSortProvider (see model/DragSortContext.tsx).
export function createDragSortState<TId extends DragSortId = DragSortId>() {
	return {
		active: makeMutable(false),
		draggedId: makeMutable<TId | null>(null),
		draggedDepth: makeMutable(0),
		translateY: makeMutable(0),
		translateX: makeMutable(0),
		lastAbsoluteY: makeMutable(0),
		dragStartContainerTop: makeMutable(0),
		dragStartScrollY: makeMutable(0),
		dragOriginY: makeMutable(0),
		dragOwnHeight: makeMutable(0),

		// id -> measured row height (own row only, without children)
		rowHeights: makeMutable<Record<string, number>>({}),

		// document-order flatten of the currently rendered list
		flatOrder: makeMutable<DragSortFlatEntry<TId>[]>([]),

		containerPageY: makeMutable(0),
		scrollY: makeMutable(0),

		dropIndex: makeMutable(-1),
		dropDepth: makeMutable(0)
	}
}

export type DragSortState<TId extends DragSortId = DragSortId> = ReturnType<
	typeof createDragSortState<TId>
>
