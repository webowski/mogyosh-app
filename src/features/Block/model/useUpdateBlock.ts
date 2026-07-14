import { BlockEntity } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { useBlockStore } from './block.store'

export const useUpdateBlock = () => {
	const mutate = (payload: {
		id: BlockId
		taskId: TaskId
		patch: Partial<
			Pick<BlockEntity, 'text_content' | 'type' | 'sort_order' | 'settings'>
		>
	}) => {
		const { updateBlock, enqueueOperation } = useBlockStore.getState()

		// 1. Instantly update UI
		updateBlock(payload.id, payload.taskId, payload.patch)

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
