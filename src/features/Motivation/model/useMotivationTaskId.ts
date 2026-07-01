import { useQuery } from '@tanstack/react-query'

import { motivationAPI } from '../repository/motivation.api'

export const useMotivationTaskId = () => {
	return useQuery({
		queryKey: ['motivation-task'],
		queryFn: () => motivationAPI.getOrCreateMotivationTask(),
		staleTime: Infinity
	})
}
