import { useQuery } from '@tanstack/react-query'

import { getTasksByDate } from './task.api'

/**
 * Get tasks for a specific date
 * Used for "Today" screen
 */
export const useTasksByDate = (date: string) => {
	return useQuery({
		queryKey: ['tasks-by-date', date],
		queryFn: async () => {
			return await getTasksByDate(date)
		}
	})
}
