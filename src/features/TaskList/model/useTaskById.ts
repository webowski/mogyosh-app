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
			if (!taskId) return null
			return await getTaskById(taskId)
		},
		enabled: !!taskId
	})
}
