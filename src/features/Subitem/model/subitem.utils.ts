import { SubitemId } from '@/shared/domain/ids'
import type { SubitemData, SubitemEntity } from '@/shared/domain/subitem'
import type { DragSortFlatEntry } from '@/shared/modules/DragSort'

export function flattenSubitemTree(
	tree: SubitemData[],
	depth = 0,
	parentId: SubitemId | null = null
): DragSortFlatEntry<SubitemId>[] {
	return tree.flatMap((item) => [
		{ id: item.id, parentId, depth },
		...flattenSubitemTree(item.children, depth + 1, item.id)
	])
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
