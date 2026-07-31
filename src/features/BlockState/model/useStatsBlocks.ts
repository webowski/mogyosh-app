import { useQuery } from '@tanstack/react-query'

import { blockAPI } from '@/features/Block/repository/block.api'
import { getBlockStatSeries } from './blockStatSeries'

export const useStatsBlocks = () => {
	return useQuery({
		queryKey: ['stats-blocks'],
		queryFn: async () => {
			const blocks = await blockAPI.getStatsBlocks()
			return blocks
				.map((block) => ({ block, series: getBlockStatSeries(block) }))
				.filter((entry) => entry.series.length > 0)
		}
	})
}
