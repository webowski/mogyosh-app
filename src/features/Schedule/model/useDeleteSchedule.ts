import { useMutation, useQueryClient } from '@tanstack/react-query'

import { scheduleAPI } from '../repository/schedule.api'

export const useDeleteSchedule = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: scheduleAPI.deleteSchedule,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
			queryClient.invalidateQueries({ queryKey: ['task'] })
		}
	})
}
