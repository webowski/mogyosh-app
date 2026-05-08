import { useQuery } from '@tanstack/react-query'

import { taskRepository } from '../repository/taskRepository'
import { TaskFilters } from './task.types'
import { groupTasksByShedule } from './task.utils'

/**
 * Get all tasks with optional filtering and categorization
 */
export const useTasksGrouped = (filters?: TaskFilters) => {
	return useQuery({
		queryKey: ['tasks-grouped', filters],
		queryFn: async () => {
			const tasks = await taskRepository.getAll(filters)
			return groupTasksByShedule(tasks)
		}
	})
}
