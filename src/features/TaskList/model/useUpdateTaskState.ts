import { useMutation, useQueryClient } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { TaskEntity, TaskState } from '@/shared/domain/task'
import { updateTaskState } from './task.api'

type TaskStateMutationParams = {
	taskId: TaskId
	state: TaskState
}

/**
 * Update task state mutation
 * Used for toggling subtask completion status
 */
export const useUpdateTaskState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ taskId, state }: TaskStateMutationParams) => {
			return await updateTaskState(taskId, state)
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
			queryClient.invalidateQueries({ queryKey: ['task-subtasks'] })
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		},
		onMutate: async ({ taskId, state }) => {
			await queryClient.cancelQueries({ queryKey: ['task-subtasks'] })

			const previous = queryClient.getQueriesData({
				queryKey: ['task-subtasks']
			})

			queryClient.setQueriesData(
				{
					queryKey: ['task-subtasks']
				},
				(old: TaskEntity[] | undefined) => {
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
