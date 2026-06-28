import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { TaskId } from '@/shared/domain/ids'
import { subitemAPI } from '../repository/subitem.api'
import { useSubitemStore } from './subitem.store'

export const useSubitems = (taskId: TaskId | null) => {
	const setSubitems = useSubitemStore((state) => state.setSubitems)

	const query = useQuery({
		queryKey: ['subitems', taskId],
		queryFn: async () => {
			if (!taskId) return []
			try {
				return await subitemAPI.getSubitems(taskId)
			} catch (error) {
				console.error('useSubitems query error:', error)
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
				// 	'[useSubitems] setSubitems called, count:',
				// 	query.data.length
				// )
				setSubitems(taskId, query.data)
			}
		},
		// eslint-disable-next-line
		[query.data, taskId]
	)

	return query
}
