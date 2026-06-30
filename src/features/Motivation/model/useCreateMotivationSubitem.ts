import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemEntity } from '@/shared/domain/subitem'
import {
	MOTIVATION_TASK_ID,
	generateMotivationSortOrder,
	selectMotivationSubitems,
	useMotivationStore
} from './motivation.store'

export const useCreateMotivationSubitem = () => {
	const { addSubitem, enqueueOperation } = useMotivationStore.getState()

	const mutate = (
		payload: {
			info: string
			parent_id?: SubitemId | null
			type?: SubitemEntity['type']
			optimisticId?: SubitemId
			afterId?: SubitemId | null
		},
		options?: { onSuccess?: (subitem: SubitemEntity) => void }
	) => {
		const subitems = selectMotivationSubitems(useMotivationStore.getState())

		const tempId = (payload.optimisticId ??
			`optimistic-${Date.now()}`) as SubitemId
		const sortOrder = generateMotivationSortOrder(
			subitems,
			payload.afterId ?? null
		)

		const optimisticSubitem: SubitemEntity = {
			id: tempId,
			task_id: MOTIVATION_TASK_ID,
			parent_id: payload.parent_id ?? null,
			type: payload.type ?? 'ul',
			info: payload.info,
			status: null,
			settings: null,
			state: null,
			priority: null,
			sort_order: sortOrder,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}

		// 1. Instantly update UI via store
		addSubitem(payload.afterId ?? null, optimisticSubitem)

		// 2. Enqueue for server sync
		enqueueOperation({
			type: 'create',
			subitem: optimisticSubitem,
			tempId
		})

		return { tempId, optimisticSubitem }
	}

	return { mutate }
}
