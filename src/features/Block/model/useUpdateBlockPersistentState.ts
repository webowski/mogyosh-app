import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getLatestCodec } from '@/features/BlockState/model/codecs/registry'
import { bytesToHex } from '@/features/BlockState/model/dayLayout'
import type { BlockMonthStateEntity, BlockType } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

type BlockPersistentStateMutationParams = {
	blockId: BlockId
	taskId: TaskId
	blockType: BlockType
	state: unknown
}

/**
 * Builds the updated states array for a block after toggling its persistent
 * ("сквозной") state — replaces the existing month = NULL row or creates it.
 */
const applyOptimisticPersistentState = (
	states: BlockMonthStateEntity[] | undefined,
	blockId: BlockId,
	blockType: BlockType,
	state: unknown
): BlockMonthStateEntity[] => {
	const existingStates = states ?? []
	const now = new Date().toISOString()
	const hasPersistentRow = existingStates.some((item) => item.month === null)

	const codec = getLatestCodec(blockType)
	const encodedState = codec.encode(state)
	const persistentPayload = new Uint8Array(1 + encodedState.length)
	persistentPayload[0] = codec.version
	persistentPayload.set(encodedState, 1)
	const persistentPayloadHex = bytesToHex(persistentPayload)

	if (hasPersistentRow) {
		return existingStates.map((item) =>
			item.month === null
				? { ...item, state: persistentPayloadHex, updated_at: now }
				: item
		)
	}

	return [
		...existingStates,
		{
			block_id: blockId,
			month: null,
			encoding: 1,
			state: persistentPayloadHex,
			created_at: now,
			updated_at: now
		}
	]
}

export const useUpdateBlockPersistentState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			blockId,
			blockType,
			state
		}: BlockPersistentStateMutationParams) => {
			return await blockAPI.setBlockPersistentCompleted({
				blockId,
				blockType,
				state
			})
		},
		onMutate: async ({ blockId, taskId, blockType, state }) => {
			const previous = useBlockStore.getState().blocksByTask[taskId]
			const block = previous?.find((item) => item.id === blockId)

			useBlockStore.getState().updateBlock(blockId, taskId, {
				states: applyOptimisticPersistentState(
					block?.states,
					blockId,
					blockType,
					state
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
