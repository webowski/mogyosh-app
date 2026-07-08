import type { DragSortState } from './dragSort.state'
import type {
	DragSortDropTarget,
	DragSortFlatEntry,
	DragSortId
} from './dragSort.types'

// Resolves target parent/prev/next sibling from a drop position,
// skipping the dragged item's own subtree so it can't become its
// own parent/descendant.
export function computeDropTarget<TId extends DragSortId>(
	flatOrder: DragSortFlatEntry<TId>[],
	draggedId: TId,
	dropIndex: number,
	dropDepth: number
): DragSortDropTarget<TId> {
	const draggedIndex = flatOrder.findIndex((entry) => entry.id === draggedId)
	const draggedItemDepth =
		draggedIndex >= 0 ? flatOrder[draggedIndex].depth : -1

	let subtreeEnd = draggedIndex + 1
	while (
		subtreeEnd < flatOrder.length &&
		flatOrder[subtreeEnd].depth > draggedItemDepth
	) {
		subtreeEnd++
	}

	const isInSubtree = (index: number) =>
		draggedIndex >= 0 && index >= draggedIndex && index < subtreeEnd

	let parentId: TId | null = null
	for (let i = dropIndex - 1; i >= 0; i--) {
		if (isInSubtree(i)) continue
		if (flatOrder[i].depth < dropDepth) {
			parentId = flatOrder[i].depth === dropDepth - 1 ? flatOrder[i].id : null
			break
		}
	}

	let prevId: TId | null = null
	for (let i = dropIndex - 1; i >= 0; i--) {
		if (isInSubtree(i)) continue
		if (flatOrder[i].depth < dropDepth) break
		if (flatOrder[i].depth === dropDepth) {
			prevId = flatOrder[i].id
			break
		}
	}

	let nextId: TId | null = null
	for (let i = dropIndex; i < flatOrder.length; i++) {
		if (isInSubtree(i)) continue
		if (flatOrder[i].depth < dropDepth) break
		if (flatOrder[i].depth === dropDepth) {
			nextId = flatOrder[i].id
			break
		}
	}

	return { parentId, prevId, nextId }
}

// Recomputes dropIndex/dropDepth from the current finger position in
// content-space, compensated for any scroll that happened since drag start.
// Called both from the row's onUpdate (finger moved) and from the
// autoscroll frame callback (list moved under a static finger).
export function recomputeDragSortDropTarget<TId extends DragSortId>(
	state: DragSortState<TId>,
	indentStep: number
) {
	'worklet'
	if (state.draggedId.value === null) return

	const order = state.flatOrder.value
	const heights = state.rowHeights.value

	const draggedIndex = order.findIndex(
		(entry) => entry.id === state.draggedId.value
	)
	const draggedItemDepth = draggedIndex >= 0 ? order[draggedIndex].depth : -1
	let subtreeEnd = draggedIndex + 1
	while (
		subtreeEnd < order.length &&
		order[subtreeEnd].depth > draggedItemDepth
	) {
		subtreeEnd++
	}
	const isInSubtree = (index: number) =>
		draggedIndex >= 0 && index >= draggedIndex && index < subtreeEnd

	const virtualFingerY =
		state.dragOriginY.value +
		state.dragPressOffsetY.value +
		state.translateY.value +
		(state.scrollY.value - state.dragStartScrollY.value)

	let cumulativeY = 0
	let hoveredIndex = order.length
	for (let i = 0; i < order.length; i++) {
		const rowHeight = heights[order[i].id] ?? 0
		if (virtualFingerY < cumulativeY + rowHeight / 2) {
			hoveredIndex = i
			break
		}
		cumulativeY += rowHeight
	}
	state.dropIndex.value = hoveredIndex

	let prevEntry = null as (typeof order)[number] | null
	for (let i = hoveredIndex - 1; i >= 0; i--) {
		if (isInSubtree(i)) continue
		prevEntry = order[i]
		break
	}
	let nextEntry = null as (typeof order)[number] | null
	for (let i = hoveredIndex; i < order.length; i++) {
		if (isInSubtree(i)) continue
		nextEntry = order[i]
		break
	}

	const maxDepth = prevEntry ? prevEntry.depth + 1 : 0
	const minDepth = nextEntry ? nextEntry.depth : 0
	const rawDepth =
		state.draggedDepth.value + Math.round(state.translateX.value / indentStep)

	state.dropDepth.value = Math.max(minDepth, Math.min(rawDepth, maxDepth))
}
