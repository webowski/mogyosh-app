import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getLatestCodec } from '@/features/BlockState/model/codecs/registry'
import {
	bytesToHex,
	getMonthStart,
	parseByteaHex,
	writeDayPayload
} from '@/features/BlockState/model/dayLayout'
import type { BlockMonthStateEntity, BlockType } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

/**
 * Builds the updated states array for a block after toggling a single day's
 * bit in the journaled bitmap — replaces (or clears) the payload for that
 * day inside the matching month row, preserving all other days untouched.
 */
const applyOptimisticDayState = (
	states: BlockMonthStateEntity[] | undefined,
	blockId: BlockId,
	blockType: BlockType,
	date: Date,
	state: unknown | null
): BlockMonthStateEntity[] => {
	const existingStates = states ?? []
	const now = new Date().toISOString()
	const monthStart = getMonthStart(date)
	const existingMonthState = existingStates.find(
		(item) => item.month === monthStart
	)
	const monthBytes = existingMonthState
		? parseByteaHex(existingMonthState.state)
		: new Uint8Array(0)

	let newPayload: Uint8Array
	if (state === null) {
		newPayload = new Uint8Array(0)
	} else {
		const codec = getLatestCodec(blockType)
		const encodedState = codec.encode(state)
		newPayload = new Uint8Array(1 + encodedState.length)
		newPayload[0] = codec.version
		newPayload.set(encodedState, 1)
	}

	const updatedMonthBytes = writeDayPayload(
		monthBytes,
		date.getDate(),
		newPayload
	)
	const updatedMonthStateHex = bytesToHex(updatedMonthBytes)

	if (existingMonthState) {
		return existingStates.map((item) =>
			item.month === monthStart
				? { ...item, state: updatedMonthStateHex, updated_at: now }
				: item
		)
	}

	return [
		...existingStates,
		{
			block_id: blockId,
			month: monthStart,
			encoding: 1,
			state: updatedMonthStateHex,
			created_at: now,
			updated_at: now
		}
	]
}

type BlockStateMutationParams = {
	blockId: BlockId
	blockType: BlockType
	taskId: TaskId
	date: Date
	state: unknown | null
}

/**
 * Update block completion for a specific day
 */
export const useUpdateBlockState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			blockId,
			blockType,
			date,
			state
		}: BlockStateMutationParams) => {
			if (state === null) {
				return await blockAPI.clearBlockDayState({ blockId, date })
			}
			return await blockAPI.setBlockCompleted({
				blockId,
				blockType,
				date,
				state
			})
		},
		onMutate: async ({ blockId, blockType, taskId, date, state }) => {
			const previous = useBlockStore.getState().blocksByTask[taskId]
			const block = previous?.find((item) => item.id === blockId)

			useBlockStore.getState().updateBlock(blockId, taskId, {
				states: applyOptimisticDayState(
					block?.states,
					blockId,
					blockType,
					date,
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
		onSuccess: (updatedBlock, variables) => {
			const { blocksByTask } = useBlockStore.getState()
			for (const taskId in blocksByTask) {
				const blocks = blocksByTask[taskId]
				if (blocks.some((block) => block.id === variables.blockId)) {
					useBlockStore.getState().updateBlock(variables.blockId, taskId, {
						states: updatedBlock.states
					})
					break
				}
			}
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
			queryClient.invalidateQueries({ queryKey: ['stats-blocks'] })
		}
	})
}
