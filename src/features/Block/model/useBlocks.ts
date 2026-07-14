import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { TaskId } from '@/shared/domain/ids'
import { blockAPI } from '../repository/block.api'
import { useBlockStore } from './block.store'

export const useBlocks = (taskId: TaskId | null) => {
	const setBlocks = useBlockStore((state) => state.setBlocks)

	const query = useQuery({
		queryKey: ['blocks', taskId],
		queryFn: async () => {
			if (!taskId) return []
			try {
				return await blockAPI.getBlocks(taskId)
			} catch (error) {
				console.error('useBlocks query error:', error)
				throw error
			}
		},
		enabled: !!taskId,
		retry: 2,
		staleTime: 5 * 60 * 1000
	})

	// Sync server data into store
	useEffect(
		() => {
			if (query.data && taskId) {
				// console.log(
				// 	'[useBlocks] setBlocks called, count:',
				// 	query.data.length
				// )
				setBlocks(taskId, query.data)
			}
		},
		// eslint-disable-next-line
		[query.data, taskId]
	)

	return query
}
