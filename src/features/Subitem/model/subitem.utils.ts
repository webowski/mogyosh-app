import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { SubitemData } from './subitem.types'

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
