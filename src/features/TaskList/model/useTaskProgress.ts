import { useQuery } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { TaskEntity } from '@/shared/domain/task'
import { taskRepository } from '../repository/taskRepository'

/**
 * Get subtasks and calculate completion progress for a task
 * @param taskId - Parent task ID
 * @returns Object with subtasks, completed count, total count, and progress (0-1)
 */
export const useTaskProgress = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task-progress', taskId],
		queryFn: async () => {
			if (!taskId) {
				return {
					subtasks: [],
					completedCount: 0,
					totalCount: 0,
					progress: 0
				}
			}

			const subtasks = await taskRepository.getSubtasks(taskId)

			const completedCount = subtasks.filter((task) => {
				return task.state === 'done'
			}).length
			const totalCount = subtasks.length
			const progress = totalCount > 0 ? completedCount / totalCount : 0

			return {
				subtasks,
				completedCount,
				totalCount,
				progress
			}
		},
		enabled: !!taskId
	})
}

/**
 * Calculate progress from subtasks array directly
 * Useful when you already have subtasks data
 */
export const calculateProgress = (subtasks: TaskEntity[]) => {
	if (subtasks.length === 0) {
		return { completedCount: 0, totalCount: 0, progress: 0 }
	}

	const completedCount = subtasks.filter((task) => task.state === 'done').length
	const totalCount = subtasks.length
	const progress = completedCount / totalCount

	return { completedCount, totalCount, progress }
}
