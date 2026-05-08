import { useQuery } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { taskRepository } from '../repository/taskRepository'

/**
 * Get subtasks for a specific task
 * Used for "Task" screen to show subtasks
 */
export const useTaskSubtasks = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task-subtasks', taskId],
		queryFn: async () => {
			// console.log('useTaskSubtasks queryFn called, taskId:', taskId)
			if (!taskId) {
				console.log('No taskId provided, returning empty array')
				return []
			}
			try {
				const result = await taskRepository.getSubtasks(taskId!)
				// console.log('useTaskSubtasks result:', result.length, 'subtasks')
				return result
			} catch (error) {
				console.error('useTaskSubtasks query error:', error)
				throw error
			}
		},
		enabled: !!taskId,
		retry: 2,
		staleTime: 5 * 60 * 1000 // 5 minutes
		// staleTime: 0,
		// gcTime: 0,
		// refetchOnMount: 'always'
	})
}
