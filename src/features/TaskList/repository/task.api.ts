import { blockAPI } from '@/features/Block'
import { supabaseClient } from '@/shared/api/supabaseClient'
import { TaskId } from '@/shared/domain/ids'
import {
	TaskCompleted,
	TaskEntity,
	TaskRow,
	TaskState
} from '@/shared/domain/task'
import { TaskFilters } from '../model/task.types'

const TASKS_SELECT = `
	*,
	categories (
		id,
		name,
		parent_id
	),
	schedules (
		id,
		type,
		start_time,
		end_time,
		date,
		weekday,
		month_day,
		month,
		start_date,
		end_date
	),
	states (
		id,
		state,
		completed,
		state_date,
		created_at
	)
`

const makeTaskObject = (task: TaskRow): TaskEntity => ({
	id: task.id,
	title: task.title,
	type: task.type,
	lifecycle: task.lifecycle,
	state: task.states?.[0]?.state ?? null,
	priority: task.priority,
	category: task.categories,
	parent_id: task.parent_id,
	schedules: task.schedules,
	sort_order: task.sort_order ?? null,
	created_at: task.created_at,
	updated_at: task.updated_at
})

const getTasks = async (filters?: TaskFilters) => {
	let query = supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('type', 'task')
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
		.eq('type', 'task')
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map(makeTaskObject)
}

/**
 * Get tasks for a specific date
 * @param date - Date in ISO format (YYYY-MM-DD)
 */
const getTasksByDate = async (date: string): Promise<TaskEntity[]> => {
	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('type', 'task')
		.or(
			`schedules.date.eq.${date},schedules.start_date.lte.${date}.and.schedules.end_date.gte.${date}`
		)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map(makeTaskObject)
}

/**
 * Get task count by day for a date range
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 */
const getTasksCountByPeriod = async (
	startDate: string,
	endDate: string
): Promise<Record<string, number>> => {
	const { data, error } = await supabaseClient
		.from('tasks')
		.select('schedules(date)')
		.eq('type', 'task')
		.or(`schedules.date.gte.${startDate}.and.schedules.date.lte.${endDate}`)

	if (error) throw error

	// Count tasks by date
	const countByDate: Record<string, number> = {}
	;(data ?? []).forEach((task) => {
		if (task.schedules && Array.isArray(task.schedules)) {
			task.schedules.forEach((schedule) => {
				if (schedule.date) {
					countByDate[schedule.date] = (countByDate[schedule.date] || 0) + 1
				}
			})
		}
	})

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
			category_id: payload.category_id ?? null
		})
		.select()
		.single()

	if (error) throw error
	return data
}

type UpdateTaskStateParams = {
	taskId: TaskId
	completed?: TaskCompleted
	state?: TaskState
}

/**
 * Update task state (done/active/archived)
 * @param taskId - Task ID to update
 * @param state - New state value
 */
const updateTaskState = async ({
	taskId,
	completed,
	state
}: UpdateTaskStateParams): Promise<TaskEntity> => {
	// Check if state record exists for this task
	const { data: existingState, error: checkError } = await supabaseClient
		.from('states')
		.select('id')
		.eq('task_id', taskId)
		.single()

	if (checkError && checkError.code !== 'PGRST116') {
		throw checkError
	}

	if (existingState) {
		// Update existing state record
		const { error: updateError } = await supabaseClient
			.from('states')
			.update({
				state,
				completed,
				state_date: new Date().toISOString()
			})
			.eq('task_id', taskId)

		if (updateError) throw updateError
	} else {
		// Insert new state record
		const { error: insertError } = await supabaseClient.from('states').insert({
			task_id: taskId,
			state,
			completed,
			state_date: new Date().toISOString()
		})

		if (insertError) throw insertError
	}

	// Fetch updated task with all relations
	const { data, error } = await supabaseClient
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('id', taskId)
		.single()

	if (error) throw error
	return makeTaskObject(data)
}

/**
 * Soft delete a task by ID (marks lifecycle as 'deleted', keeps all data intact)
 * Cascades to child blocks so they also disappear from active views
 * @param taskId - Task ID to soft delete
 */
const deleteTask = async (taskId: TaskId): Promise<void> => {
	const { error: taskError } = await supabaseClient
		.from('tasks')
		.update({ lifecycle: 'deleted' })
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
 * Intended to be used for tasks already in the trash (lifecycle: 'deleted')
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
	updateTasksSortOrder
}
