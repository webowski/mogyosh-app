import { useQuery } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { getTaskSubtasks } from './task.api'

/**
 * Get subtasks for a specific task
 * Used for "Task" screen to show subtasks
 */
export const useTaskSubtasks = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task-subtasks', taskId],
		queryFn: async () => {
			if (!taskId) return []
			return await getTaskSubtasks(taskId)
		},
		enabled: !!taskId
	})
}
