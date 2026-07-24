import { useQuery } from '@tanstack/react-query'

import { blockAPI } from '@/features/Block'
import { isBlockChecked } from '@/features/BlockState/model/blockState.utils'
import { BlockEntity } from '@/shared/domain/block'
import { TaskId } from '@/shared/domain/ids'
import { useCalendarStore } from '@/shared/model/calendar.store'

/**
 * Get blocks and calculate completion progress for a task on the selected day
 * @param taskId - Parent task ID
 * @returns Object with blocks, completed count, total count, and progress (0-1)
 */
export const useTaskProgress = (taskId: TaskId | null) => {
	const selectedDate = useCalendarStore((store) => store.selectedDate)

	return useQuery({
		queryKey: ['task-progress', taskId, selectedDate.toDateString()],
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
			const { completedCount, totalCount, progress } = calculateProgress(
				blocks,
				selectedDate
			)

			return { blocks, completedCount, totalCount, progress }
		},
		enabled: !!taskId
	})
}

/**
 * Calculate progress from blocks array directly for a specific calendar day
 * Useful when you already have blocks data
 */
export const calculateProgress = (blocks: BlockEntity[], date: Date) => {
	if (blocks.length === 0) {
		return { completedCount: 0, totalCount: 0, progress: 0 }
	}

	const completedCount = blocks.filter((block) =>
		isBlockChecked(block, date)
	).length
	const totalCount = blocks.length
	const progress = completedCount / totalCount

	return { completedCount, totalCount, progress }
}
