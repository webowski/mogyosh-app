import {
	MOTIVATION_TASK_ID,
	useMotivationStore
} from '@/features/Motivation/model/motivation.store'
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
		// Dispatch to motivation store when dealing with motivation subitems
		if (payload.taskId === MOTIVATION_TASK_ID) {
			const { updateSubitem, enqueueOperation } = useMotivationStore.getState()

			// 1. Instantly update UI
			updateSubitem(payload.id, payload.patch)

			// 2. Enqueue for server sync
			enqueueOperation({
				type: 'update',
				id: payload.id,
				patch: payload.patch
			})
			return
		}

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
