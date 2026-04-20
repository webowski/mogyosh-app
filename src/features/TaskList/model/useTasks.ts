import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
	createTask,
	getTaskById,
	getTaskSubtasks,
	getTasks,
	getTasksByDate,
	getTasksCountByPeriod
} from '@/features/TaskList/model/task.api'
import { TaskId } from '@/shared/domain/ids'
import { CalendarDayData, TaskFilters } from './task.types'
import { categorizeTasks } from './task.utils'

/**
 * Get all tasks with optional filtering and categorization
 */
export const useTasks = (filters?: TaskFilters) => {
	return useQuery({
		queryKey: ['tasks', filters],
		queryFn: async () => {
			const tasks = await getTasks(filters)
			return categorizeTasks(tasks)
		}
	})
}

/**
 * Get all tasks as a flat list (without categorization)
 * Useful for custom filtering logic
 */
export const useTasksFlat = (filters?: TaskFilters) => {
	return useQuery({
		queryKey: ['tasks-flat', filters],
		queryFn: async () => {
			return await getTasks(filters)
		}
	})
}

/**
 * Get tasks for a specific date
 * Used for "Today" screen
 */
export const useTasksByDate = (date: string) => {
	return useQuery({
		queryKey: ['tasks-by-date', date],
		queryFn: async () => {
			return await getTasksByDate(date)
		}
	})
}

/**
 * Get a single task by ID
 * Used for "Task" screen
 */
export const useTaskById = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task', taskId],
		queryFn: async () => {
			if (!taskId) return null
			return await getTaskById(taskId)
		},
		enabled: !!taskId
	})
}

/**
 * Get subtasks for a specific task
 * Used for "Task" screen to show subtasks
 */
export const useTaskSubtasks = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task-subtasks', taskId],
		queryFn: async () => {
			if (!taskId) return []
			return await getTaskSubtasks(taskId)
		},
		enabled: !!taskId
	})
}

/**
 * Get task counts by day for a date range
 * Used for "Calendar" screen
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 */
export const useTasksCountByPeriod = (startDate: string, endDate: string) => {
	return useQuery({
		queryKey: ['tasks-count-period', startDate, endDate],
		queryFn: async () => {
			const countByDate = await getTasksCountByPeriod(startDate, endDate)

			// Convert to array of CalendarDayData
			const days: CalendarDayData[] = Object.entries(countByDate).map(
				([date, count]) => ({
					date,
					count: count as number,
					taskIds: []
				})
			)

			return { startDate, endDate, days }
		}
	})
}

/**
 * Get task count for a specific day
 * Used for "Calendar" screen day cells
 */
export const useTasksCountByDay = (date: string) => {
	return useQuery({
		queryKey: ['tasks-count-day', date],
		queryFn: async () => {
			const countByDate = await getTasksCountByPeriod(date, date)
			return countByDate[date] || 0
		}
	})
}

export const useCreateTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
		}
	})
}
