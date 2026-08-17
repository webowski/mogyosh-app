import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BlockType } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

type BlockStateMutationParams = {
	blockId: BlockId
	blockType: BlockType
	taskId?: TaskId
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
