import { useQuery } from '@tanstack/react-query'

import { taskAPI } from '../repository/task.api'
import { TaskFilters } from './task.types'
import { groupTasksByShedule } from './task.utils'

/**
 * Tasks for a specific calendar day, grouped by schedule sections.
 */
export const useTasksGrouped = (dateString: string, filters?: TaskFilters) => {
	return useQuery({
		queryKey: ['tasks-grouped', dateString, filters],
		queryFn: async () => {
			const tasks = await taskAPI.getTasksByDate(dateString)
			return groupTasksByShedule(tasks, dateString)
		},
		enabled: Boolean(dateString)
	})
}
