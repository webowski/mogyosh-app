import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TaskId } from '@/shared/domain/ids'
import type { TaskEntity, TaskState } from '@/shared/domain/task'
import { taskRepository } from '../repository/taskRepository'

type TaskStateMutationParams = {
	taskId: TaskId
	state: TaskState
}

export const useUpdateTaskState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ taskId, state }: TaskStateMutationParams) =>
			taskRepository.updateState(taskId, state),
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
				{ queryKey: ['task-subtasks'] },
				(old: TaskEntity[] | undefined) =>
					old?.map((task) => (task.id === taskId ? { ...task, state } : task))
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
