import { BlockId, TaskId } from '@/shared/domain/ids'
import { useBlockStore } from './block.store'

export type ReorderBlockPayload = {
	id: BlockId
	taskId: TaskId
	newParentId: BlockId | null
	prevId: BlockId | null
	nextId: BlockId | null
}

// Plain function (not just a hook) — needs to be callable from a
// scheduleOnRN callback triggered off the UI thread, outside React render.
export const reorderBlock = (payload: ReorderBlockPayload) => {
	const { reorderBlock: applyReorder, enqueueOperation } =
		useBlockStore.getState()

	applyReorder(
		payload.id,
		payload.taskId,
		payload.newParentId,
		payload.prevId,
		payload.nextId
	)

	const moved = useBlockStore
		.getState()
		.blocksByTask[payload.taskId]?.find((s) => s.id === payload.id)

	// if (__DEV__) {
	// 	log('reorderBlock debug', JSON.stringify({ payload, moved }))
	// }

	if (!moved) return

	enqueueOperation({
		type: 'update',
		id: payload.id,
		taskId: payload.taskId,
		patch: {
			parent_id: moved.parent_id ?? null,
			sort_order: moved.sort_order
		}
	})
}

export const useReorderBlock = () => ({ mutate: reorderBlock })
