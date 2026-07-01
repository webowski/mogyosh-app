import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
	MOTIVATION_TASK_ID,
	useMotivationStore
} from '@/features/Motivation/model/motivation.store'
import { motivationAPI } from '@/features/Motivation/repository/motivation.api'
import { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemState } from '@/shared/domain/subitem'
import { subitemAPI } from '../repository/subitem.api'
import { useSubitemStore } from './subitem.store'

type SubitemStateMutationParams = {
	subitemId: SubitemId
	taskId?: TaskId
	state: SubitemState
}

/**
 * Update task state mutation
 * Used for toggling subitem completion status
 */
export const useUpdateSubitemState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			subitemId,
			taskId,
			state
		}: SubitemStateMutationParams) => {
			// Motivation subitems store state in motivation_subitem_states table
			if (taskId === MOTIVATION_TASK_ID) {
				// Optimistic UI update
				useMotivationStore.getState().updateSubitem(subitemId, { state })
				// Persist to DB
				await motivationAPI.updateMotivationSubitemState(subitemId, state)
				return
			}

			return await subitemAPI.updateSubitemState(subitemId, state)
		},
		onSuccess: (_, variables) => {
			if (variables.taskId === MOTIVATION_TASK_ID) {
				// State already updated optimistically in mutationFn
				return
			}

			// Update store directly
			const { subitemsByTask } = useSubitemStore.getState()
			for (const taskId in subitemsByTask) {
				const subitems = subitemsByTask[taskId]
				if (subitems.some((s) => s.id === variables.subitemId)) {
					useSubitemStore
						.getState()
						.updateSubitem(variables.subitemId, taskId, {
							state: variables.state
						})
					break
				}
			}
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		}
		// onMutate: async ({ subitemId, state }) => {
		// 	await queryClient.cancelQueries({ queryKey: ['subitems'] })

		// 	const previous = queryClient.getQueriesData({
		// 		queryKey: ['subitems']
		// 	})

		// 	queryClient.setQueriesData(
		// 		{
		// 			queryKey: ['subitems']
		// 		},
		// 		(old: SubitemEntity[] | undefined) => {
		// 			return old?.map((subitem) => {
		// 				return subitem.id === subitemId ? { ...subitem, state } : subitem
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
