import { generateKeyBetween } from 'fractional-indexing'

import type { CategoryId, TaskId } from '@/shared/domain/ids'
import type {
	CategoryMap,
	MonthStateEntity,
	TaskEntity
} from '@/shared/domain/task'
import { getMonthStart, isDayBitSet, parseByteaHex } from './task.bitmap'
import { TaskFilters, TaskSection } from './task.types'

/**
 * Filter tasks by search query, category, lifecycle, and priority
 */
export const filterTasks = (
	tasks: TaskEntity[],
	filters?: TaskFilters
): TaskEntity[] => {
	return tasks.filter((task) => {
		if (filters?.searchQuery) {
			const query = filters.searchQuery.toLowerCase()
			if (!task.title.toLowerCase().includes(query)) {
				return false
			}
		}

		if (filters?.categoryId && task.category?.id !== filters.categoryId) {
			return false
		}

		if (filters?.lifecycle && task.lifecycle !== filters.lifecycle) {
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
 * - "during_the_day": tasks without start_time
 * - "by_time": tasks with start_time
 */
export const groupTasksByShedule = (tasks: TaskEntity[]): TaskSection[] => {
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
			id: 'during_the_day',
			title: 'During the day',
			data: duringDayTasks
		})
	}

	if (byTimeTasks.length > 0) {
		sections.push({
			id: 'by_time',
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

export const isByTime = (task: TaskEntity): boolean => {
	return typeof task.schedules?.[0]?.start_time === 'string'
}

export const generateTaskSortOrder = (
	prevOrder: string | null,
	nextOrder: string | null
): string => generateKeyBetween(prevOrder, nextOrder)

export const buildDuringDaySortOrderSeed = (
	tasks: TaskEntity[]
): { id: TaskId; sort_order: string }[] | null => {
	if (tasks.every((task) => task.sort_order)) return null

	let previousOrder: string | null = null

	return tasks.map((task) => {
		const sortOrder = generateKeyBetween(previousOrder, null)
		previousOrder = sortOrder
		return { id: task.id, sort_order: sortOrder }
	})
}

export const makeCategoryPath = (
	categoryId: CategoryId,
	map: CategoryMap
): string => {
	const parts: string[] = []

	let current = map[categoryId]

	const visited = new Set<string>()

	while (current && !visited.has(current.id)) {
		visited.add(current.id)
		parts.unshift(current.name)
		current = current.parent_id ? map[current.parent_id] : undefined
	}

	return parts.join(' • ')
}

/**
 * Checks whether a task is marked completed on a specific calendar day
 */
export const isTaskCompletedOnDate = (
	states: MonthStateEntity[] | undefined,
	date: Date
): boolean => {
	if (!states || states.length === 0) return false

	const monthStart = getMonthStart(date)
	const monthState = states.find((taskState) => taskState.month === monthStart)

	if (!monthState) return false

	const completedBytes = parseByteaHex(monthState.completed)
	return isDayBitSet(completedBytes, date.getDate())
}
