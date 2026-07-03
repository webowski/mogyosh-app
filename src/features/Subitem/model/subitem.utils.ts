import { SubitemId } from '@/shared/domain/ids'
import type { SubitemData, SubitemEntity } from '@/shared/domain/subitem'

export type SubitemFlatEntry = {
	id: SubitemId
	parentId: SubitemId | null
	depth: number
}
// Document-order flatten, used for drag-n-drop position math.
// Note: currently ignores per-node collapsed state (isChildShown lives
// locally inside SubitemNode) — collapsed children still count for
// positioning. Acceptable trade-off for now.
export function flattenSubitemTree(
	tree: SubitemData[],
	depth = 0,
	parentId: SubitemId | null = null
): SubitemFlatEntry[] {
	return tree.flatMap((item) => [
		{ id: item.id, parentId, depth },
		...flattenSubitemTree(item.children, depth + 1, item.id)
	])
}

// Resolves target parent/prev/next sibling from a drop position,
// skipping the dragged item's own subtree so it can't become its
// own parent/descendant.
export function computeDropTarget(
	flatOrder: SubitemFlatEntry[],
	draggedId: SubitemId,
	dropIndex: number,
	dropDepth: number
): {
	parentId: SubitemId | null
	prevId: SubitemId | null
	nextId: SubitemId | null
} {
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

	let parentId: SubitemId | null = null
	for (let i = dropIndex - 1; i >= 0; i--) {
		if (isInSubtree(i)) continue
		if (flatOrder[i].depth < dropDepth) {
			parentId = flatOrder[i].depth === dropDepth - 1 ? flatOrder[i].id : null
			break
		}
	}

	let prevId: SubitemId | null = null
	for (let i = dropIndex - 1; i >= 0; i--) {
		if (isInSubtree(i)) continue
		if (flatOrder[i].depth < dropDepth) break
		if (flatOrder[i].depth === dropDepth) {
			prevId = flatOrder[i].id
			break
		}
	}

	let nextId: SubitemId | null = null
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

// Helper: build tree from flat list
export function buildSubitemTree(
	subitems: SubitemEntity[],
	parentId: SubitemId | null = null
): SubitemData[] {
	return subitems
		.filter((item) => (item.parent_id ?? null) === parentId)
		.map((item) => ({
			...item,
			children: buildSubitemTree(subitems, item.id)
		}))
}
