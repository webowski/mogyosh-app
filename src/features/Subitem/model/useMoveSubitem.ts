import { SubitemId, TaskId } from '@/shared/domain/ids'
import { type SubitemMoveDirection, useSubitemStore } from './subitem.store'

export const useMoveSubitem = () => {
	const mutate = (payload: {
		id: SubitemId
		taskId: TaskId
		direction: SubitemMoveDirection
	}) => {
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
