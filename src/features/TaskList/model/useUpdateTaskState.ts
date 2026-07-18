import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isSameDay } from 'date-fns'

import { TaskId } from '@/shared/domain/ids'
import {
	StateEntity,
	TaskCompleted,
	TaskEntity,
	TaskState
} from '@/shared/domain/task'
import { taskAPI } from '../repository/task.api'
import { TaskSection } from './task.types'

type TaskStateMutationParams = {
	taskId: TaskId
	completed?: TaskCompleted
	state?: TaskState
	date?: Date
}

const applyOptimisticState = (
	task: TaskEntity,
	taskId: TaskId,
	targetDate: Date,
	completed?: TaskCompleted,
	state?: TaskState
): TaskEntity => {
	if (task.id !== taskId) return task

	const existingStates = task.states ?? []
	const hasStateForDate = existingStates.some((taskState) =>
		isSameDay(new Date(taskState.created_at), targetDate)
	)

	const updatedStates: StateEntity[] = hasStateForDate
		? existingStates.map((taskState) =>
				isSameDay(new Date(taskState.created_at), targetDate)
					? {
							...taskState,
							completed: completed ?? taskState.completed,
							state: state ?? taskState.state
						}
					: taskState
			)
		: [
				...existingStates,
				{
					id: `optimistic-${taskId}-${targetDate.toISOString()}`,
					task_id: taskId,
					state: state ?? 'active',
					completed: completed ?? false,
					created_at: targetDate.toISOString()
				}
			]

	return { ...task, states: updatedStates }
}

/**
 * Update task state mutation
 * Used for toggling task completion status for a specific calendar day
 */
export const useUpdateTaskState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			completed,
			state,
			date
		}: TaskStateMutationParams) => {
			return await taskAPI.updateTaskState({ taskId, completed, state, date })
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
			queryClient.invalidateQueries({ queryKey: ['blocks'] })
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		},
		onMutate: async ({ taskId, completed, state, date }) => {
			const targetDate = date ?? new Date()

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
						applyOptimisticState(task, taskId, targetDate, completed, state)
					)
				}
			)

			queryClient.setQueriesData(
				{ queryKey: ['tasks'] },
				(old: TaskEntity[] | undefined) => {
					return old?.map((task) =>
						applyOptimisticState(task, taskId, targetDate, completed, state)
					)
				}
			)

			queryClient.setQueriesData(
				{ queryKey: ['tasks-grouped'] },
				(old: TaskSection[] | undefined) => {
					return old?.map((section) => ({
						...section,
						data: section.data.map((task) =>
							applyOptimisticState(task, taskId, targetDate, completed, state)
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
