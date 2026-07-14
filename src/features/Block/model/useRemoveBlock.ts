import { BlockId, TaskId } from '@/shared/domain/ids'
import { selectBlocks, useBlockStore } from './block.store'

export const useRemoveBlock = () => {
	const { removeBlock, enqueueOperation } = useBlockStore.getState()

	const mutate = (payload: { id: BlockId; taskId: TaskId }) => {
		const currentBlocks = selectBlocks(payload.taskId)(useBlockStore.getState())
		const removedBlock = currentBlocks.find((block) => block.id === payload.id)
		const newParentId = removedBlock?.parent_id ?? null
		const reparentedChildren = currentBlocks.filter(
			(block) => block.parent_id === payload.id
		)

		// 1. Instantly update UI (removes item, reparents its direct children)
		removeBlock(payload.id, payload.taskId)

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
