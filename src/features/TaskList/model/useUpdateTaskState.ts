import { useMutation, useQueryClient } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { updateTaskState } from './task.api'

/**
 * Update task state mutation
 * Used for toggling subtask completion status
 */
export const useUpdateTaskState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			state
		}: {
			taskId: TaskId
			state: 'done' | 'active' | 'archived'
		}) => {
			return await updateTaskState(taskId, state)
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
			queryClient.invalidateQueries({
				queryKey: ['task-subtasks', variables.taskId]
			})
			queryClient.invalidateQueries({
				queryKey: ['task-progress', variables.taskId]
			})
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		}
	})
}
