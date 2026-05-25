import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/task'
import { SubitemWithChildren } from './subitem.types'

// Helper: build tree from flat list
export function buildSubitemTree(
	subitems: SubitemEntity[],
	parentId: SubitemId | null = null
): SubitemWithChildren[] {
	return subitems
		.filter((item) => (item.parent_id ?? null) === parentId)
		.map((item) => ({
			...item,
			children: buildSubitemTree(subitems, item.id)
		}))
}
