import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { BlockMonthStateEntity } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

type BlockPersistentStateMutationParams = {
	blockId: BlockId
	taskId: TaskId
	completed: boolean
}

/**
 * Builds the updated states array for a block after toggling its persistent
 * ("сквозной") state — replaces the existing month = NULL row or creates it.
 */
const applyOptimisticPersistentState = (
	states: BlockMonthStateEntity[] | undefined,
	blockId: BlockId,
	completed: boolean
): BlockMonthStateEntity[] => {
	const existingStates = states ?? []
	const now = new Date().toISOString()
	const hasPersistentRow = existingStates.some((state) => state.month === null)

	// checkbox codec v1 payload: version byte 0x01 + msgpack true(0xc3)/false(0xc2)
	const persistentPayload = completed ? '\\x01c3' : '\\x01c2'

	if (hasPersistentRow) {
		return existingStates.map((state) =>
			state.month === null
				? { ...state, state: persistentPayload, updated_at: now }
				: state
		)
	}

	return [
		...existingStates,
		{
			block_id: blockId,
			month: null,
			encoding: 1,
			state: persistentPayload,
			created_at: now,
			updated_at: now
		}
	]
}

/**
 * Updates a throughline ("сквозной") block's completion for non-journaled tasks
 */
export const useUpdateBlockPersistentState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			blockId,
			completed
		}: BlockPersistentStateMutationParams) => {
			return await blockAPI.setBlockPersistentCompleted({ blockId, completed })
		},
		onMutate: async ({ blockId, taskId, completed }) => {
			const previous = useBlockStore.getState().blocksByTask[taskId]
			const block = previous?.find((item) => item.id === blockId)

			useBlockStore.getState().updateBlock(blockId, taskId, {
				states: applyOptimisticPersistentState(
					block?.states,
					blockId,
					completed
				)
			})

			return { previous, taskId }
		},
		onError: (_err, _vars, context) => {
			if (!context) return
			useBlockStore.setState((state) => ({
				blocksByTask: {
					...state.blocksByTask,
					[context.taskId]: context.previous
				}
			}))
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		}
	})
}
