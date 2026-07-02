import { useQuery } from '@tanstack/react-query'

import { motivationAPI } from '../repository/motivation.api'

export const useMotivationItemId = () => {
	return useQuery({
		queryKey: ['motivation-item'],
		queryFn: () => motivationAPI.getOrCreateMotivationItem(),
		staleTime: Infinity
	})
}
