import { TaskEntity } from '@/shared/domain/task'
import { TaskFilters, TaskSection } from './task.types'

/**
 * Filter tasks by search query, category, status, and priority
 */
export const filterTasks = (
	tasks: TaskEntity[],
	filters?: TaskFilters
): TaskEntity[] => {
	return tasks.filter((task) => {
		if (filters?.searchQuery) {
			const query = filters.searchQuery.toLowerCase()
			if (!task.info.toLowerCase().includes(query)) {
				return false
			}
		}

		if (filters?.categoryId && task.category?.id !== filters.categoryId) {
			return false
		}

		if (filters?.status && task.status !== filters.status) {
			return false
		}

		if (filters?.priority !== undefined && task.priority !== filters.priority) {
			return false
		}

		return true
	})
}

/**
 * Categorize tasks into sections based on their schedules
 * - "During the day": tasks without start_time
 * - "By time": tasks with start_time
 */
export const categorizeTasks = (tasks: TaskEntity[]): TaskSection[] => {
	// Tasks with start_time go to "By time"
	const byTimeTasks = tasks.filter((task) => {
		return (
			task.schedules &&
			task.schedules.some((s) => {
				return s.start_time !== null && s.start_time !== undefined
			})
		)
	})

	// Tasks without start_time go to "During the day"
	const duringDayTasks = tasks.filter((task) => {
		return (
			!task.schedules ||
			task.schedules.every((s) => {
				return s.start_time === null || s.start_time === undefined
			})
		)
	})

	const sections: TaskSection[] = []

	if (duringDayTasks.length > 0) {
		sections.push({
			title: 'During the day',
			data: duringDayTasks
		})
	}

	if (byTimeTasks.length > 0) {
		sections.push({
			title: 'By time',
			data: byTimeTasks
		})
	}

	return sections
}

/**
 * Filter tasks by date
 * Checks if task has schedules that match the given date
 */
export const filterTasksByDate = (tasks: TaskEntity[], date: string) => {
	return tasks.filter((task) => {
		if (!task.schedules || task.schedules.length === 0) {
			return false
		}

		return task.schedules.some((schedule) => {
			// Check exact date match
			if (schedule.date === date) {
				return true
			}

			// Check if date is within start_date and end_date range
			if (schedule.start_date && schedule.end_date) {
				return date >= schedule.start_date && date <= schedule.end_date
			}

			return false
		})
	})
}

/**
 * Count tasks by day for a date range
 */
export const countTasksByDay = (
	tasks: TaskEntity[],
	startDate: string,
	endDate: string
) => {
	const countByDate: Record<string, number> = {}

	tasks.forEach((task) => {
		if (task.schedules && Array.isArray(task.schedules)) {
			task.schedules.forEach((schedule) => {
				if (
					schedule.date &&
					schedule.date >= startDate &&
					schedule.date <= endDate
				) {
					countByDate[schedule.date] = (countByDate[schedule.date] || 0) + 1
				}
			})
		}
	})

	return countByDate
}

/**
 * Get subtasks from a list of tasks
 */
export const getSubtasksFromList = (
	tasks: TaskEntity[],
	parentTaskId: string
) => {
	return tasks.filter((task) => {
		// Assuming subtasks have parent_id or are linked via schedules
		// This may need adjustment based on your actual data structure
		return task.schedules?.some((s) => s.id === parentTaskId) || false
	})
}
