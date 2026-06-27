import { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { useQueryClient } from '@tanstack/react-query'
import {
	generateSubitemSortOrder,
	selectSubitems,
	useSubitemStore
} from './subitem.store'

export const useCreateSubitem = () => {
	const queryClient = useQueryClient()
	const { addSubitem, enqueueOperation } = useSubitemStore.getState()

	const mutate = (
		payload: {
			info: string
			task_id: TaskId | null
			parent_id?: SubitemId | null
			type?: SubitemEntity['type']
			optimisticId?: SubitemId
			afterId?: SubitemId | null
		},
		options?: { onSuccess?: (subitem: SubitemEntity) => void }
	) => {
		const taskId = payload.task_id as TaskId
		const subitems = selectSubitems(taskId)(useSubitemStore.getState())

		const tempId = (payload.optimisticId ??
			`optimistic-${Date.now()}`) as SubitemId
		const sort_order = generateSubitemSortOrder(
			subitems,
			payload.afterId ?? null
		)

		const optimisticSubitem: SubitemEntity = {
			id: tempId,
			task_id: taskId,
			parent_id: payload.parent_id ?? null,
			type: payload.type ?? 'ul',
			info: payload.info,
			status: null,
			settings: null,
			state: null,
			priority: null,
			sort_order,
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

		// Invalidate task counters
		queryClient.invalidateQueries({ queryKey: ['tasks'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })

		return { tempId, optimisticSubitem }
	}

	return { mutate }
}
