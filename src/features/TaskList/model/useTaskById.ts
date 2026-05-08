import { useQuery } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { getTaskById } from './task.api'

/**
 * Get a single task by ID
 * Used for "Task" screen
 */
export const useTaskById = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task', taskId],
		queryFn: async () => {
			// console.log('useTaskById queryFn called, taskId:', taskId)
			if (!taskId) {
				console.log('No taskId provided, returning null')
				return null
			}
			try {
				const result = await getTaskById(taskId)
				// console.log('useTaskById result:', result)
				return result
			} catch (error) {
				console.error('useTaskById query error:', error)
				throw error
			}
		},
		enabled: !!taskId,
		retry: 2,
		staleTime: 5 * 60 * 1000 // 5 minutes
		// staleTime: 5 * 60 * 1000 // 5 minutes
	})
}
