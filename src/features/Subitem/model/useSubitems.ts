// import { useQuery } from '@tanstack/react-query'

// import { TaskId } from '@/shared/domain/ids'
// import { subitemAPI } from '../repository/subitem.api'

// /**
//  * Get subitems for a specific task
//  * Used for "Task" screen to show subitems
//  */
// export const useSubitems = (taskId: TaskId | null) => {
// 	return useQuery({
// 		queryKey: ['subitems', taskId],
// 		queryFn: async () => {
// 			// console.log('useSubitems queryFn called, taskId:', taskId)
// 			if (!taskId) {
// 				console.log('No taskId provided, returning empty array')
// 				return []
// 			}
// 			try {
// 				const result = await subitemAPI.getSubitems(taskId)
// 				// console.log('useSubitems result:', result.length, 'subitems')
// 				return result
// 			} catch (error) {
// 				console.error('useSubitems query error:', error)
// 				throw error
// 			}
// 		},
// 		enabled: !!taskId,
// 		retry: 2,
// 		staleTime: 5 * 60 * 1000 // 5 minutes
// 		// staleTime: 0,
// 		// gcTime: 0,
// 		// refetchOnMount: 'always'
// 	})
// }

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
				setSubitems(taskId, query.data)
			}
		},
		// eslint-disable-next-line
		[query.data, taskId]
	)

	return query
}
