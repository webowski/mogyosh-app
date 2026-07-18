import { useMutation, useQueryClient } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { MonthStateEntity, TaskEntity } from '@/shared/domain/task'
import { taskAPI } from '../repository/task.api'
import { getMonthStart, parseByteaHex } from './task.bitmap'
import { TaskSection } from './task.types'

type TaskDayCompletedMutationParams = {
	taskId: TaskId
	date: Date
	completed: boolean
}

/**
 * Optimistically flips a single day bit within the cached month bitmap,
 * mirroring the exact bit math the Postgres function performs server-side.
 */
const applyOptimisticDayBit = (
	task: TaskEntity,
	taskId: TaskId,
	date: Date,
	completed: boolean
): TaskEntity => {
	if (task.id !== taskId) return task

	const monthStart = getMonthStart(date)
	const dayOfMonth = date.getDate()
	const existingStates = task.states ?? []
	const existingMonthState = existingStates.find(
		(taskState) => taskState.month === monthStart
	)

	const currentBytes = existingMonthState
		? parseByteaHex(existingMonthState.completed)
		: new Uint8Array(4)

	const nextBytes = new Uint8Array(currentBytes)
	const byteIndex = Math.floor((dayOfMonth - 1) / 8)
	const bitIndex = (dayOfMonth - 1) % 8

	if (completed) {
		nextBytes[byteIndex] |= 1 << bitIndex
	} else {
		nextBytes[byteIndex] &= ~(1 << bitIndex)
	}

	const nextHex =
		'\\x' +
		Array.from(nextBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

	const updatedMonthState: MonthStateEntity = {
		task_id: taskId,
		month: monthStart,
		completed: nextHex,
		created_at: existingMonthState?.created_at ?? new Date().toISOString(),
		updated_at: new Date().toISOString()
	}

	const updatedStates = existingMonthState
		? existingStates.map((taskState) =>
				taskState.month === monthStart ? updatedMonthState : taskState
			)
		: [...existingStates, updatedMonthState]

	return { ...task, states: updatedStates }
}

/**
 * Toggles task completion for a specific calendar day
 */
export const useUpdateTaskState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			date,
			completed
		}: TaskDayCompletedMutationParams) => {
			return await taskAPI.setTaskDayCompleted({ taskId, date, completed })
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		},
		onMutate: async ({ taskId, date, completed }) => {
			await queryClient.cancelQueries({ queryKey: ['tasks'] })
			await queryClient.cancelQueries({ queryKey: ['tasks-grouped'] })

			const previousTasks = queryClient.getQueriesData({ queryKey: ['tasks'] })
			const previousTasksGrouped = queryClient.getQueriesData({
				queryKey: ['tasks-grouped']
			})

			queryClient.setQueriesData(
				{ queryKey: ['tasks'] },
				(old: TaskEntity[] | undefined) =>
					old?.map((task) =>
						applyOptimisticDayBit(task, taskId, date, completed)
					)
			)

			queryClient.setQueriesData(
				{ queryKey: ['tasks-grouped'] },
				(old: TaskSection[] | undefined) =>
					old?.map((section) => ({
						...section,
						data: section.data.map((task) =>
							applyOptimisticDayBit(task, taskId, date, completed)
						)
					}))
			)

			return { previousTasks, previousTasksGrouped }
		},
		onError: (_err, _vars, context) => {
			context?.previousTasks.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
			context?.previousTasksGrouped.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
		}
	})
}
