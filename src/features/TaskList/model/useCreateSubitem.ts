import { useMutation, useQueryClient } from '@tanstack/react-query'

import { subitemAPI } from '../repository/subitem.api'

export const useCreateSubitem = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: subitemAPI.createSubitem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['subitems'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
		}
	})
}
