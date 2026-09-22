import { endOfDay, startOfDay } from 'date-fns'

import { blockAPI } from '@/features/Block'
import { isScheduledOnDate } from '@/features/Schedule/model/schedule.utils'
import { scheduleAPI } from '@/features/Schedule/repository/schedule.api'
import { supabaseClient } from '@/shared/api/supabaseClient'
import { TaskId } from '@/shared/domain/ids'
import type {
	ScheduleData,
	TaskCompleted,
	TaskEntity,
	TaskRow,
	TaskState
} from '@/shared/domain/task'
import { getMonthStart } from '../model/task.bitmap'
import { TaskFilters } from '../model/task.types'

const TASKS_SELECT = `
	*,
	categories (
		id,
		name,
		parent_id
	),
	schedules (
		task_id,
		encoding,
		schedule,
		created_at,
		updated_at
	),
	states (
		task_id,
		month,
		completed,
		created_at,
		updated_at
	)
`

const makeTaskObject = (task: TaskRow): TaskEntity => ({
	id: task.id,
	title: task.title,
	type: task.type,
	lifecycle: task.lifecycle,
	states: task.states,
	priority: task.priority,
	category: task.categories,
	parent_id: task.parent_id,
	schedule: scheduleAPI.decodeScheduleFromRow(
		// supabase returns nested relation as object or array depending on cardinality
		(task as any).schedules
	),
	sort_order: task.sort_order ?? null,
	created_at: task.created_at,
	updated_at: task.updated_at
})

const getTasks = async (filters?: TaskFilters) => {
	let query = supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('type', 't')
		.is('parent_id', null)
		.order('sort_order', { ascending: true, nullsFirst: false })
		.order('created_at', { ascending: false })

	if (filters?.categoryId) {
		const categoryIds = Array.isArray(filters.categoryId)
			? filters.categoryId
			: [filters.categoryId]

		if (categoryIds.includes('uncategorized')) {
			query = query.is('category_id', null)
		} else {
			const validIds = categoryIds.filter((id) => id !== 'uncategorized')
			if (validIds.length > 0) {
				query = query.in('category_id', validIds)
			}
		}
	}

	if (filters?.lifecycle) {
		query = query.eq('lifecycle', filters.lifecycle)
	}

	if (filters?.priority) {
		query = query.eq('priority', filters.priority)
	}

	if (filters?.searchQuery) {
		query = query.ilike('title', `%${filters.searchQuery}%`)
	}

	const { data, error } = await query

	if (error) {
		console.error('getTasks error:', error)
		throw error
	}

	return (data ?? []).map(makeTaskObject)
}

const getAllTasks = async (): Promise<TaskEntity[]> => {
	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('type', 't')
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map(makeTaskObject)
}

/**
 * Get tasks for a specific date.
 * Loads tasks with schedules and filters on the client via codec expand.
 */
const getTasksByDate = async (date: string): Promise<TaskEntity[]> => {
	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('type', 't')
		.eq('lifecycle', 'a')
		.is('parent_id', null)
		// only tasks that have a schedule row
		.not('schedules', 'is', null)
		.order('created_at', { ascending: false })

	if (error) throw error

	const tasks = (data ?? []).map(makeTaskObject)

	return tasks.filter((task) => {
		if (!task.schedule) return false
		return isScheduledOnDate(task.schedule.schedule, date)
	})
}

const getTasksCountByPeriod = async (
	startDate: string,
	endDate: string
): Promise<Record<string, number>> => {
	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('type', 't')
		.eq('lifecycle', 'a')
		.is('parent_id', null)

	if (error) throw error

	const tasks = (data ?? []).map(makeTaskObject)
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

/**
 * Get a single task by ID with all relations
 */
const getTaskById = async (taskId: TaskId): Promise<TaskEntity | null> => {
	try {
		// console.log('Fetching task by ID:', taskId)

		const { data, error } = await supabaseClient
			.from('tasks')
			.select(TASKS_SELECT)
			.eq('id', taskId)
			.single()

		if (error) {
			console.error('Error fetching task by ID:', error)
			// Handle specific Supabase error codes
			if (error.code === 'PGRST116') {
				// Row not found
				console.warn('Task not found:', taskId)
				return null
			}
			throw error
		}

		if (!data) {
			console.warn('Task not found:', taskId)
			return null
		}

		// console.log('Task fetched successfully:', data.id)
		return makeTaskObject(data)
	} catch (error) {
		console.error('getTaskById caught error:', error)
		throw error
	}
}

type CreateTaskPayload = {
	title: string
	parent_id?: string | null
	category_id?: string | null
	scheduleData?: ScheduleData | null
}

const createTask = async (payload: CreateTaskPayload): Promise<TaskEntity> => {
	const { data: userData } = await supabaseClient.auth.getUser()
	const userId = userData?.user?.id

	const { data, error } = await supabaseClient
		.from('tasks')
		.insert({
			title: payload.title,
			user_id: userId,
			parent_id: payload.parent_id ?? null,
			category_id: payload.category_id ?? null,
			type: 't',
			lifecycle: 'a'
		})
		.select()
		.single()

	if (error) throw error

	if (payload.scheduleData) {
		await scheduleAPI.upsertSchedule({
			taskId: data.id,
			data: payload.scheduleData
		})
	}

	const task = await getTaskById(data.id)
	if (!task) throw new Error('Task not found after create')
	return task
}

type UpdateTaskStateParams = {
	taskId: TaskId
	completed?: TaskCompleted
	state?: TaskState
	date?: Date
}

/**
 * Update task state for a specific day (upserts a states row scoped to that calendar day)
 * @param taskId - Task ID to update
 * @param date - Calendar day this state applies to (defaults to now)
 */
const updateTaskState = async ({
	taskId,
	completed,
	state,
	date
}: UpdateTaskStateParams): Promise<TaskEntity> => {
	const targetDate = date ?? new Date()
	const dayStart = startOfDay(targetDate).toISOString()
	const dayEnd = endOfDay(targetDate).toISOString()

	const { data: existingState, error: checkError } = await supabaseClient
		.from('states')
		.select('id')
		.eq('task_id', taskId)
		.gte('created_at', dayStart)
		.lte('created_at', dayEnd)
		.maybeSingle()

	if (checkError) throw checkError

	if (existingState) {
		const { error: updateError } = await supabaseClient
			.from('states')
			.update({ state, completed })
			.eq('id', existingState.id)

		if (updateError) throw updateError
	} else {
		const { error: insertError } = await supabaseClient.from('states').insert({
			task_id: taskId,
			state: state ?? 'active',
			completed,
			created_at: targetDate.toISOString()
		})

		if (insertError) throw insertError
	}

	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('id', taskId)
		.single()

	if (error) throw error
	return makeTaskObject(data)
}

type SetTaskDayCompletedParams = {
	taskId: TaskId
	date: Date
	completed: boolean
}

/**
 * Toggles a single day's completion bit via an atomic RPC call.
 * The Postgres function handles row creation, bit math, and concurrency.
 */
const setTaskDayCompleted = async ({
	taskId,
	date,
	completed
}: SetTaskDayCompletedParams): Promise<TaskEntity> => {
	const monthStart = getMonthStart(date)
	const dayOfMonth = date.getDate()

	const { error: rpcError } = await supabaseClient.rpc(
		'set_task_day_completed',
		{
			p_task_id: taskId,
			p_month: monthStart,
			p_day_of_month: dayOfMonth,
			p_completed: completed
		}
	)

	if (rpcError) throw rpcError

	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('id', taskId)
		.single()

	if (error) throw error
	return makeTaskObject(data)
}

/**
 * Soft delete a task by ID (marks lifecycle as 'd', keeps all data intact)
 * Cascades to child blocks so they also disappear from active views
 * @param taskId - Task ID to soft delete
 */
const deleteTask = async (taskId: TaskId): Promise<void> => {
	const { error: taskError } = await supabaseClient
		.from('tasks')
		.update({ lifecycle: 'd' })
		.eq('id', taskId)

	if (taskError) throw taskError

	// Cascade soft delete to child blocks
	const blocks = await blockAPI.getBlocks(taskId)
	for (const block of blocks) {
		await deleteTask(block.id)
	}
}

/**
 * Permanently delete a task by ID (hard delete with cascading)
 * Intended to be used for tasks already in the trash (lifecycle: 'd')
 * @param taskId - Task ID to delete permanently
 */
const deleteTaskPermanently = async (taskId: TaskId): Promise<void> => {
	// Delete task states first
	const { error: statesError } = await supabaseClient
		.from('states')
		.delete()
		.eq('task_id', taskId)

	if (statesError) throw statesError

	// Delete task schedules
	const { error: schedulesError } = await supabaseClient
		.from('schedules')
		.delete()
		.eq('task_id', taskId)

	if (schedulesError) throw schedulesError

	// Delete blocks recursively
	const blocks = await blockAPI.getBlocks(taskId)
	for (const block of blocks) {
		await deleteTaskPermanently(block.id)
	}

	// Delete the task itself
	const { error: taskError } = await supabaseClient
		.from('tasks')
		.delete()
		.eq('id', taskId)

	if (taskError) throw taskError
}

const updateTaskSortOrder = async (
	taskId: TaskId,
	sortOrder: string
): Promise<void> => {
	const { error } = await supabaseClient
		.from('tasks')
		.update({ sort_order: sortOrder })
		.eq('id', taskId)

	if (error) throw error
}

const updateTasksSortOrder = async (
	updates: { id: TaskId; sort_order: string }[]
): Promise<void> => {
	const results = await Promise.all(
		updates.map((update) =>
			supabaseClient
				.from('tasks')
				.update({ sort_order: update.sort_order })
				.eq('id', update.id)
		)
	)

	const failed = results.find((result) => result.error)
	if (failed?.error) throw failed.error
}

type MonthCompletionRow = {
	task_id: string
	day_of_month: number
	completed: boolean
}

export type TasksMonthCompletion = Map<string, Set<number>> // taskId -> set of completed day numbers

/**
 * Batch-fetches per-day completion for a set of tasks within one month.
 * Used by calendar month-grid views to avoid parsing bitmap per task on the client.
 */
const getTasksMonthCompletion = async (
	taskIds: TaskId[],
	month: Date
): Promise<TasksMonthCompletion> => {
	if (taskIds.length === 0) return new Map()

	const monthStart = getMonthStart(month)

	const { data, error } = await supabaseClient.rpc(
		'get_tasks_month_completion',
		{
			p_task_ids: taskIds,
			p_month: monthStart
		}
	)

	if (error) throw error

	const result: TasksMonthCompletion = new Map()

	for (const row of data as MonthCompletionRow[]) {
		if (!row.completed) continue

		if (!result.has(row.task_id)) {
			result.set(row.task_id, new Set())
		}

		result.get(row.task_id)?.add(row.day_of_month)
	}

	return result
}

export const taskAPI = {
	getTasks,
	getAllTasks,
	getTasksByDate,
	getTasksCountByPeriod,
	getTaskById,
	createTask,
	updateTaskState,
	deleteTask,
	deleteTaskPermanently,
	updateTaskSortOrder,
	updateTasksSortOrder,
	setTaskDayCompleted,
	getTasksMonthCompletion
}
