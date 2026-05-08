import { useQuery } from '@tanstack/react-query'

import { getTasks } from '@/features/TaskList/model/task.api'
import { TaskFilters } from './task.types'

/**
 * Get all tasks as a flat list (without categorization)
 * Useful for custom filtering logic
 */
export const useTasks = (filters?: TaskFilters) => {
	return useQuery({
		queryKey: ['tasks', filters],
		queryFn: async () => {
			return await getTasks(filters)
		}
	})
}
