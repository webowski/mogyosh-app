import { useQuery } from '@tanstack/react-query'

import { taskRepository } from '../repository/taskRepository'

/**
 * Get task count for a specific day
 * Used for "Calendar" screen day cells
 */
export const useTasksCountByDay = (date: string) => {
	return useQuery({
		queryKey: ['tasks-count-day', date],
		queryFn: async () => {
			const countByDate = await taskRepository.getCountByPeriod(date, date)
			return countByDate[date] || 0
		}
	})
}
