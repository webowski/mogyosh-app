import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity, SubitemState } from '@/shared/domain/task'
import { subitemAPI } from '../repository/subitem.api'

type SubitemStateMutationParams = {
	taskId: SubitemId
	state: SubitemState
}

/**
 * Update task state mutation
 * Used for toggling subitem completion status
 */
export const useUpdateSubitemState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ taskId, state }: SubitemStateMutationParams) => {
			return await subitemAPI.updateSubitemState(taskId, state)
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
			queryClient.invalidateQueries({ queryKey: ['subitems'] })
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		},
		onMutate: async ({ taskId, state }) => {
			await queryClient.cancelQueries({ queryKey: ['subitems'] })

			const previous = queryClient.getQueriesData({
				queryKey: ['subitems']
			})

			queryClient.setQueriesData(
				{
					queryKey: ['subitems']
				},
				(old: SubitemEntity[] | undefined) => {
					return old?.map((task) => {
						return task.id === taskId ? { ...task, state } : task
					})
				}
			)

			return { previous }
		},
		onError: (_err, _vars, context) => {
			context?.previous.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
		}
	})
}
