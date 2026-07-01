import { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { useSubitemStore } from './subitem.store'

export const useUpdateSubitem = () => {
	const mutate = (payload: {
		id: SubitemId
		taskId: TaskId
		patch: Partial<
			Pick<SubitemEntity, 'info' | 'type' | 'sort_order' | 'settings'>
		>
	}) => {
		const { updateSubitem, enqueueOperation } = useSubitemStore.getState()

		// 1. Instantly update UI
		updateSubitem(payload.id, payload.taskId, payload.patch)

		// 2. Enqueue for server sync
		enqueueOperation({
			type: 'update',
			id: payload.id,
			taskId: payload.taskId,
			patch: payload.patch
		})
	}

	return { mutate }
}
