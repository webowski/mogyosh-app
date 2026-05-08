import { useQuery } from '@tanstack/react-query'

import { taskRepository } from '../repository/taskRepository'
import type { TaskFilters } from './task.types'

export const useTasks = (filters?: TaskFilters) => {
	return useQuery({
		queryKey: ['tasks', filters],
		queryFn: () => taskRepository.getAll(filters)
	})
}
