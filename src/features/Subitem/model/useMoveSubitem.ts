import {
	MOTIVATION_TASK_ID,
	useMotivationStore
} from '@/features/Motivation/model/motivation.store'
import { SubitemId, TaskId } from '@/shared/domain/ids'
import { type SubitemMoveDirection, useSubitemStore } from './subitem.store'

export const useMoveSubitem = () => {
	const mutate = (payload: {
		id: SubitemId
		taskId: TaskId
		direction: SubitemMoveDirection
	}) => {
		// Dispatch to motivation store when dealing with motivation subitems
		if (payload.taskId === MOTIVATION_TASK_ID) {
			const { moveSubitem, enqueueOperation } = useMotivationStore.getState()

			moveSubitem(payload.id, payload.direction)

			const moved = useMotivationStore
				.getState()
				.subitems.find((s) => s.id === payload.id)
			if (!moved) return

			enqueueOperation({
				type: 'update',
				id: payload.id,
				patch: { sort_order: moved.sort_order }
			})
			return
		}

		const { moveSubitem, enqueueOperation } = useSubitemStore.getState()

		moveSubitem(payload.id, payload.taskId, payload.direction)

		const moved = useSubitemStore
			.getState()
			.subitemsByTask[payload.taskId]?.find((s) => s.id === payload.id)
		if (!moved) return

		enqueueOperation({
			type: 'update',
			id: payload.id,
			taskId: payload.taskId,
			patch: { sort_order: moved.sort_order }
		})
	}

	return { mutate }
}
