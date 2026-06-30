import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { motivationAPI } from '../repository/motivation.api'
import { useMotivationStore } from './motivation.store'

export const useMotivationSubitems = () => {
	const setSubitems = useMotivationStore((state) => state.setSubitems)

	const query = useQuery({
		queryKey: ['motivation-subitems'],
		queryFn: async () => {
			try {
				return await motivationAPI.getMotivationSubitems()
			} catch (error) {
				console.error('useMotivationSubitems query error:', error)
				throw error
			}
		},
		retry: 2,
		staleTime: 5 * 60 * 1000
	})

	// Sync server data into store
	useEffect(
		() => {
			if (query.data) {
				setSubitems(query.data)
			}
		},
		// eslint-disable-next-line
		[query.data]
	)

	return query
}
