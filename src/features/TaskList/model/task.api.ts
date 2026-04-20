import { supabase } from '@/shared/api/supabase'
import { TaskId } from '@/shared/domain/ids'
import { TaskEntity } from '@/shared/domain/task'

export const getTasks = async (): Promise<TaskEntity[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select(
			`
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
			)
		`
		)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map((task) => ({
		id: task.id,
		info: task.info,
		status: task.status,
		priority: task.priority,
		category: task.categories,
		schedules: task.schedules,
		created_at: task.created_at,
		updated_at: task.updated_at
	}))
}

/**
 * Get tasks for a specific date
 * @param date - Date in ISO format (YYYY-MM-DD)
 */
export const getTasksByDate = async (date: string): Promise<TaskEntity[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select(
			`
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
			)
		`
		)
		.or(
			`schedules.date.eq.${date},schedules.start_date.lte.${date}.and.schedules.end_date.gte.${date}`
		)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map((task) => ({
		id: task.id,
		info: task.info,
		status: task.status,
		priority: task.priority,
		category: task.categories,
		schedules: task.schedules,
		created_at: task.created_at,
		updated_at: task.updated_at
	}))
}

/**
 * Get subtasks for a specific task
 * @param taskId - Parent task ID
 */
export const getTaskSubtasks = async (
	taskId: TaskId
): Promise<TaskEntity[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select(
			`
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
			)
		`
		)
		.eq('parent_id', taskId)
		.order('created_at', { ascending: true })

	if (error) throw error

	return (data ?? []).map((task) => ({
		id: task.id,
		info: task.info,
		status: task.status,
		priority: task.priority,
		category: task.categories,
		schedules: task.schedules,
		created_at: task.created_at,
		updated_at: task.updated_at
	}))
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
	const { data, error } = await supabase
		.from('tasks')
		.select(
			`
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
			)
		`
		)
		.eq('id', taskId)
		.single()

	if (error) throw error
	if (!data) return null

	return {
		id: data.id,
		info: data.info,
		status: data.status,
		priority: data.priority,
		category: data.categories,
		schedules: data.schedules,
		created_at: data.created_at,
		updated_at: data.updated_at
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
