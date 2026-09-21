import { generateKeyBetween } from 'fractional-indexing'

import { getScheduleTimesForDate, isScheduledOnDate } from '@/features/Schedule'
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
 * Categorize tasks into sections based on schedule times for a given date.
 */
export const groupTasksByShedule = (
	tasks: TaskEntity[],
	dateString: string
): TaskSection[] => {
	const byTimeTasks: TaskEntity[] = []
	const duringDayTasks: TaskEntity[] = []

	for (const task of tasks) {
		if (!task.schedule) {
			duringDayTasks.push(task)
			continue
		}

		const times = getScheduleTimesForDate(task.schedule.schedule, dateString)
		const hasTime = times.some(
			(slot) => slot.time !== null && slot.time !== undefined
		)

		if (hasTime) {
			byTimeTasks.push(task)
		} else {
			duringDayTasks.push(task)
		}
	}

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
		if (!task.schedule) return false
		return isScheduledOnDate(task.schedule.schedule, date)
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
	const cursor = new Date(startDate + 'T00:00:00')
	const end = new Date(endDate + 'T00:00:00')

	while (cursor <= end) {
		const dateString = cursor.toISOString().slice(0, 10)

		for (const task of tasks) {
			if (!task.schedule) continue
			if (isScheduledOnDate(task.schedule.schedule, dateString)) {
				countByDate[dateString] = (countByDate[dateString] || 0) + 1
			}
		}

		cursor.setDate(cursor.getDate() + 1)
	}

	return countByDate
}

export const isByTime = (task: TaskEntity, dateString: string): boolean => {
	if (!task.schedule) return false
	const times = getScheduleTimesForDate(task.schedule.schedule, dateString)
	return times.some(
		(slot) => typeof slot.time === 'string' && slot.time.length > 0
	)
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
