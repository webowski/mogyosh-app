import { SubitemId, TaskId } from '@/shared/domain/ids'
import { useSubitemStore } from './subitem.store'

export const useRemoveSubitem = () => {
	const { removeSubitem, enqueueOperation } = useSubitemStore.getState()

	const mutate = (payload: { id: SubitemId; taskId: TaskId }) => {
		// 1. Instantly update UI
		removeSubitem(payload.id, payload.taskId)

		// 2. Enqueue for server sync
		enqueueOperation({
			type: 'delete',
			id: payload.id,
			taskId: payload.taskId
		})
	}

	return { mutate }
}
