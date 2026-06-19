import { useQuery } from '@tanstack/react-query'

import { subitemAPI } from '@/features/Subitem'
import { TaskId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'

/**
 * Get subitems and calculate completion progress for a task
 * @param taskId - Parent task ID
 * @returns Object with subitems, completed count, total count, and progress (0-1)
 */
export const useTaskProgress = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task-progress', taskId],
		queryFn: async () => {
			if (!taskId) {
				return {
					subitems: [],
					completedCount: 0,
					totalCount: 0,
					progress: 0
				}
			}

			const subitems = await subitemAPI.getSubitems(taskId)

			const completedCount = subitems.filter((subitem) => {
				return subitem.state === 'done'
			}).length
			const totalCount = subitems.length
			const progress = totalCount > 0 ? completedCount / totalCount : 0

			return {
				subitems,
				completedCount,
				totalCount,
				progress
			}
		},
		enabled: !!taskId
	})
}

/**
 * Calculate progress from subitems array directly
 * Useful when you already have subitems data
 */
export const calculateProgress = (subitems: SubitemEntity[]) => {
	if (subitems.length === 0) {
		return { completedCount: 0, totalCount: 0, progress: 0 }
	}

	const completedCount = subitems.filter(
		(subitem) => subitem.state === 'done'
	).length
	const totalCount = subitems.length
	const progress = completedCount / totalCount

	return { completedCount, totalCount, progress }
}
