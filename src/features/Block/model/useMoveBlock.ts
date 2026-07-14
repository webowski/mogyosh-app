import { BlockId, TaskId } from '@/shared/domain/ids'
import { type BlockMoveDirection, useBlockStore } from './block.store'

export const useMoveBlock = () => {
	const mutate = (payload: {
		id: BlockId
		taskId: TaskId
		direction: BlockMoveDirection
	}) => {
		const { moveBlock, enqueueOperation } = useBlockStore.getState()

		moveBlock(payload.id, payload.taskId, payload.direction)

		const moved = useBlockStore
			.getState()
			.blocksByTask[payload.taskId]?.find((s) => s.id === payload.id)
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
