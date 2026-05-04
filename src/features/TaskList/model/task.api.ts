import { supabase } from '@/shared/api/supabase'
import { TaskId } from '@/shared/domain/ids'
import { CategoryEntity, TaskEntity, TaskRow } from '@/shared/domain/task'
import { TaskFilters } from './task.types'

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
		state_date,
		created_at
	)
`

export const makeTaskObject = (task: TaskRow): TaskEntity => ({
	id: task.id,
	info: task.info,
	status: task.status,
	state: task.states?.[0]?.state ?? null,
	priority: task.priority,
	category: task.categories,
	parent_id: task.parent_id,
	schedules: task.schedules,
	created_at: task.created_at,
	updated_at: task.updated_at
})

export const getTasks = async (filters?: TaskFilters) => {
	let query = supabase
		.from('tasks')
		.select(TASKS_SELECT)
		.is('parent_id', null)
		.order('created_at', { ascending: false })

	if (filters?.categoryId) {
		query = query.eq('category_id', filters.categoryId)
	}

	if (filters?.status) {
		query = query.eq('status', filters.status)
	}

	if (filters?.priority) {
		query = query.eq('priority', filters.priority)
	}

	if (filters?.searchQuery) {
		query = query.ilike('info', `%${filters.searchQuery}%`)
	}

	const { data, error } = await query

	if (error) {
		console.error('getTasks error:', error)
		throw error
	}

	return (data ?? []).map(makeTaskObject)
}

export const getAllTasks = async (): Promise<TaskEntity[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select(TASKS_SELECT)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map(makeTaskObject)
}

/**
 * Get tasks for a specific date
 * @param date - Date in ISO format (YYYY-MM-DD)
 */
export const getTasksByDate = async (date: string): Promise<TaskEntity[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select(TASKS_SELECT)
		.or(
			`schedules.date.eq.${date},schedules.start_date.lte.${date}.and.schedules.end_date.gte.${date}`
		)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map(makeTaskObject)
}

/**
 * Get subtasks for a specific task
 * @param taskId - Parent task ID
 */
export const getTaskSubtasks = async (
	taskId: TaskId
): Promise<TaskEntity[]> => {
	try {
		// console.log('Fetching subtasks for task ID:', taskId)

		const { data, error } = await supabase
			.from('tasks')
			.select(TASKS_SELECT)
			.eq('parent_id', taskId)
			.order('created_at', { ascending: true })

		if (error) {
			console.error('Error fetching subtasks:', error)
			throw error
		}

		const subtasks = (data ?? []).map(makeTaskObject)
		// console.log('Subtasks fetched successfully:', subtasks.length)
		return subtasks
	} catch (error) {
		console.error('getTaskSubtasks caught error:', error)
		throw error
	}
}

/**
 * Get task count by day for a date range
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 */
export const getTasksCountByPeriod = async (
	startDate: string,
	endDate: string
): Promise<Record<string, number>> => {
	const { data, error } = await supabase
		.from('tasks')
		.select('schedules(date)')
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
export const getTaskById = async (
	taskId: TaskId
): Promise<TaskEntity | null> => {
	try {
		// console.log('Fetching task by ID:', taskId)

		const { data, error } = await supabase
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

export const createTask = async (info: string): Promise<TaskEntity> => {
	const { data: userData } = await supabase.auth.getUser()
	const userId = userData?.user?.id

	const { data, error } = await supabase
		.from('tasks')
		.insert({ info, user_id: userId })
		.select()
		.single()

	if (error) throw error
	return data
}

export const getCategories = async (): Promise<CategoryEntity[]> => {
	const { data, error } = await supabase
		.from('categories')
		.select('id, name, parent_id')

	if (error) throw error
	return data ?? []
}

/**
 * Update task state (done/active/archived)
 * @param taskId - Task ID to update
 * @param state - New state value
 */
export const updateTaskState = async (
	taskId: TaskId,
	state: 'done' | 'active' | 'archived'
): Promise<TaskEntity> => {
	// Check if state record exists for this task
	const { data: existingState, error: checkError } = await supabase
		.from('states')
		.select('id')
		.eq('task_id', taskId)
		.single()

	if (checkError && checkError.code !== 'PGRST116') {
		throw checkError
	}

	if (existingState) {
		// Update existing state record
		const { error: updateError } = await supabase
			.from('states')
			.update({
				state,
				state_date: new Date().toISOString()
			})
			.eq('task_id', taskId)

		if (updateError) throw updateError
	} else {
		// Insert new state record
		const { error: insertError } = await supabase.from('states').insert({
			task_id: taskId,
			state,
			state_date: new Date().toISOString()
		})

		if (insertError) throw insertError
	}

	// Fetch updated task with all relations
	const { data, error } = await supabase
		.from('tasks')
		.select(TASKS_SELECT)
		.eq('id', taskId)
		.single()

	if (error) throw error
	return makeTaskObject(data)
}
