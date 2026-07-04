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
