import { useMutation, useQueryClient } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { TaskCompleted, TaskEntity, TaskState } from '@/shared/domain/task'
import { taskAPI } from '../repository/task.api'
import { TaskSection } from './task.types'

const applyTaskUpdate = (
	task: TaskEntity,
	taskId: TaskId,
	completed?: TaskCompleted,
	state?: TaskState
): TaskEntity => (task.id === taskId ? { ...task, completed, state } : task)

type TaskStateMutationParams = {
	taskId: TaskId
	completed?: TaskCompleted
	state?: TaskState
}

/**
 * Update task state mutation
 * Used for toggling block completion status
 */
export const useUpdateTaskState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			completed,
			state
		}: TaskStateMutationParams) => {
			return await taskAPI.updateTaskState({ taskId, completed, state })
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
			queryClient.invalidateQueries({ queryKey: ['blocks'] })
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		},
		onMutate: async ({ taskId, completed, state }) => {
			await queryClient.cancelQueries({ queryKey: ['blocks'] })
			await queryClient.cancelQueries({ queryKey: ['tasks'] })
			await queryClient.cancelQueries({ queryKey: ['tasks-grouped'] })

			const previousBlocks = queryClient.getQueriesData({
				queryKey: ['blocks']
			})
			const previousTasks = queryClient.getQueriesData({
				queryKey: ['tasks']
			})
			const previousTasksGrouped = queryClient.getQueriesData({
				queryKey: ['tasks-grouped']
			})

			queryClient.setQueriesData(
				{ queryKey: ['blocks'] },
				(old: TaskEntity[] | undefined) => {
					return old?.map((task) =>
						applyTaskUpdate(task, taskId, completed, state)
					)
				}
			)

			queryClient.setQueriesData(
				{ queryKey: ['tasks'] },
				(old: TaskEntity[] | undefined) => {
					return old?.map((task) =>
						applyTaskUpdate(task, taskId, completed, state)
					)
				}
			)

			queryClient.setQueriesData(
				{ queryKey: ['tasks-grouped'] },
				(old: TaskSection[] | undefined) => {
					return old?.map((section) => ({
						...section,
						data: section.data.map((task) =>
							applyTaskUpdate(task, taskId, completed, state)
						)
					}))
				}
			)

			return { previousBlocks, previousTasks, previousTasksGrouped }
		},
		onError: (_err, _vars, context) => {
			context?.previousBlocks.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
			context?.previousTasks.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
			context?.previousTasksGrouped.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
		}
	})
}
