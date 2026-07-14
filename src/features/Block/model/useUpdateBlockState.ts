import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BlockState } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

type BlockStateMutationParams = {
	blockId: BlockId
	taskId?: TaskId
	state: BlockState
}

/**
 * Update task state mutation
 * Used for toggling block completion status
 */
export const useUpdateBlockState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ blockId, state }: BlockStateMutationParams) => {
			return await blockAPI.updateBlockState(blockId, state)
		},
		onSuccess: (_, variables) => {
			// Update store directly
			const { blocksByTask } = useBlockStore.getState()
			for (const taskId in blocksByTask) {
				const blocks = blocksByTask[taskId]
				if (blocks.some((s) => s.id === variables.blockId)) {
					useBlockStore.getState().updateBlock(variables.blockId, taskId, {
						state: variables.state
					})
					break
				}
			}
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		}
		// onMutate: async ({ blockId, state }) => {
		// 	await queryClient.cancelQueries({ queryKey: ['blocks'] })

		// 	const previous = queryClient.getQueriesData({
		// 		queryKey: ['blocks']
		// 	})

		// 	queryClient.setQueriesData(
		// 		{
		// 			queryKey: ['blocks']
		// 		},
		// 		(old: BlockEntity[] | undefined) => {
		// 			return old?.map((block) => {
		// 				return block.id === blockId ? { ...block, state } : block
		// 			})
		// 		}
		// 	)

		// 	return { previous }
		// },
		// onError: (_err, _vars, context) => {
		// 	context?.previous.forEach(([key, data]) => {
		// 		queryClient.setQueryData(key, data)
		// 	})
		// }
	})
}
