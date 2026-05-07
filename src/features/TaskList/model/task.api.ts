import { TaskId } from '@/shared/domain/ids'
import { CategoryEntity, TaskEntity } from '@/shared/domain/task'
import { categoryRepository } from '../repository/categoryRepository'
import { taskRepository } from '../repository/taskRepository'
import { TaskFilters } from './task.types'

export const getTasks = async (filters?: TaskFilters) => {
	return await taskRepository.getTasks(filters)
}

export const getAllTasks = async (): Promise<TaskEntity[]> => {
	return await taskRepository.getAllTasks()
}

/**
 * Get tasks for a specific date
 * @param date - Date in ISO format (YYYY-MM-DD)
 */
export const getTasksByDate = async (date: string): Promise<TaskEntity[]> => {
	return await taskRepository.getTasksByDate(date)
}

/**
 * Get subtasks for a specific task
 * @param taskId - Parent task ID
 */
export const getTaskSubtasks = async (
	taskId: TaskId
): Promise<TaskEntity[]> => {
	return await taskRepository.getTaskSubtasks(taskId)
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
	return await taskRepository.getTasksCountByPeriod(startDate, endDate)
}

/**
 * Get a single task by ID with all relations
 */
export const getTaskById = async (
	taskId: TaskId
): Promise<TaskEntity | null> => {
	return await taskRepository.getTaskById(taskId)
}

export const createTask = async (info: string): Promise<TaskEntity> => {
	return await taskRepository.createTask(info)
}

export const getCategories = async (): Promise<CategoryEntity[]> => {
	return await categoryRepository.getCategories()
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
	return await taskRepository.updateTaskState(taskId, state)
}
