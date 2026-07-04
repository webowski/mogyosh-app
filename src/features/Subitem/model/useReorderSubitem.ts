import { SubitemId, TaskId } from '@/shared/domain/ids'
import { useSubitemStore } from './subitem.store'

export type ReorderSubitemPayload = {
	id: SubitemId
	taskId: TaskId
	newParentId: SubitemId | null
	prevId: SubitemId | null
	nextId: SubitemId | null
}

// Plain function (not just a hook) — needs to be callable from a
// scheduleOnRN callback triggered off the UI thread, outside React render.
export const reorderSubitem = (payload: ReorderSubitemPayload) => {
	const { reorderSubitem: applyReorder, enqueueOperation } =
		useSubitemStore.getState()

	applyReorder(
		payload.id,
		payload.taskId,
		payload.newParentId,
		payload.prevId,
		payload.nextId
	)

	const moved = useSubitemStore
		.getState()
		.subitemsByTask[payload.taskId]?.find((s) => s.id === payload.id)
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

export const useReorderSubitem = () => ({ mutate: reorderSubitem })
