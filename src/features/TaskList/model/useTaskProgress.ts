import { useQuery } from '@tanstack/react-query'

import { blockAPI } from '@/features/Block'
import { BlockEntity } from '@/shared/domain/block'
import { TaskId } from '@/shared/domain/ids'

/**
 * Get blocks and calculate completion progress for a task
 * @param taskId - Parent task ID
 * @returns Object with blocks, completed count, total count, and progress (0-1)
 */
export const useTaskProgress = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task-progress', taskId],
		queryFn: async () => {
			if (!taskId) {
				return {
					blocks: [],
					completedCount: 0,
					totalCount: 0,
					progress: 0
				}
			}

			const blocks = await blockAPI.getBlocks(taskId)

			const completedCount = blocks.filter((block) => {
				return block.state === 'done'
			}).length
			const totalCount = blocks.length
			const progress = totalCount > 0 ? completedCount / totalCount : 0

			return {
				blocks,
				completedCount,
				totalCount,
				progress
			}
		},
		enabled: !!taskId
	})
}

/**
 * Calculate progress from blocks array directly
 * Useful when you already have blocks data
 */
export const calculateProgress = (blocks: BlockEntity[]) => {
	if (blocks.length === 0) {
		return { completedCount: 0, totalCount: 0, progress: 0 }
	}

	const completedCount = blocks.filter((block) => block.state === 'done').length
	const totalCount = blocks.length
	const progress = completedCount / totalCount

	return { completedCount, totalCount, progress }
}
