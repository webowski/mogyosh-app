import { useQuery } from '@tanstack/react-query'

import { taskAPI } from '../repository/task.api'

/**
 * Get motivation task (special task with type = 'motivation')
 * Used for "Motivation" screen
 */
export const useMotivationTask = () => {
	return useQuery({
		queryKey: ['motivation-task'],
		queryFn: async () => {
			try {
				const result = await taskAPI.getMotivationTask()
				return result
			} catch (error) {
				console.error('useMotivationTask query error:', error)
				throw error
			}
		},
		retry: 2,
		staleTime: 5 * 60 * 1000 // 5 minutes
	})
}
