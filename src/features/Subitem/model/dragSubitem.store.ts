import { makeMutable } from 'react-native-reanimated'

import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemFlatEntry } from './subitem.utils'

// Runtime-only drag-n-drop state shared between JS and UI thread.
// Not a Zustand store — plain Reanimated mutables created once at module
// scope, same idea as `inputRefs` in editorToolbar.store.ts.
export const dragSubitemState = {
	active: makeMutable(false),
	draggedId: makeMutable<SubitemId | null>(null),
	draggedDepth: makeMutable(0),
	translateY: makeMutable(0),
	translateX: makeMutable(0),
	lastAbsoluteY: makeMutable(0),

	// id -> measured row height (own row only, without children)
	rowHeights: makeMutable<Record<string, number>>({}),

	// document-order flatten of the currently rendered tree
	flatOrder: makeMutable<SubitemFlatEntry[]>([]),

	containerPageY: makeMutable(0),
	scrollY: makeMutable(0),

	dropIndex: makeMutable(-1),
	dropDepth: makeMutable(0)
}

export const DRAG_INDENT_STEP = 16
export const DRAG_LONG_PRESS_MS = 350
export const DRAG_AUTOSCROLL_EDGE = 80
export const DRAG_AUTOSCROLL_SPEED = 6
