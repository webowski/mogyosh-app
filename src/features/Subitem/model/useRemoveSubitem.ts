import { SubitemId, TaskId } from '@/shared/domain/ids'
import { selectSubitems, useSubitemStore } from './subitem.store'

export const useRemoveSubitem = () => {
	const { removeSubitem, enqueueOperation } = useSubitemStore.getState()

	const mutate = (payload: { id: SubitemId; taskId: TaskId }) => {
		const currentSubitems = selectSubitems(payload.taskId)(
			useSubitemStore.getState()
		)
		const removedSubitem = currentSubitems.find(
			(subitem) => subitem.id === payload.id
		)
		const newParentId = removedSubitem?.parent_id ?? null
		const reparentedChildren = currentSubitems.filter(
			(subitem) => subitem.parent_id === payload.id
		)

		// 1. Instantly update UI (removes item, reparents its direct children)
		removeSubitem(payload.id, payload.taskId)

		// 2. Enqueue for server sync
		enqueueOperation({
			type: 'delete',
			id: payload.id,
			taskId: payload.taskId
		})

		for (const child of reparentedChildren) {
			enqueueOperation({
				type: 'update',
				id: child.id,
				taskId: payload.taskId,
				patch: { parent_id: newParentId }
			})
		}
	}

	return { mutate }
}
