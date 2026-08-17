import { useQuery } from '@tanstack/react-query'

import { blockAPI } from '@/features/Block/repository/block.api'
import type { TaskId } from '@/shared/domain/ids'
import { getBlockStatSeries } from './blockStatSeries'

export const useStatsBlocks = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['stats-blocks', taskId],
		queryFn: async () => {
			const blocks = await blockAPI.getStatsBlocks(taskId as TaskId)
			return blocks
				.map((block) => ({ block, series: getBlockStatSeries(block) }))
				.filter((entry) => entry.series.length > 0)
		},
		enabled: taskId !== null
	})
}
