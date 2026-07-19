import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BlockId, TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

type BlockStateMutationParams = {
	blockId: BlockId
	taskId?: TaskId
	date: Date
	completed: boolean
}

/**
 * Update block completion for a specific day
 */
export const useUpdateBlockState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			blockId,
			date,
			completed
		}: BlockStateMutationParams) => {
			return await blockAPI.setBlockCompleted({ blockId, date, completed })
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
		}
	})
}
