import { useMutation, useQueryClient } from '@tanstack/react-query'

import { scheduleAPI } from '../repository/schedule.api'

export const useRemoveScheduleException = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			taskId,
			dateString
		}: {
			taskId: string
			dateString: string
		}) => scheduleAPI.removeScheduleException(taskId, dateString),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
			queryClient.invalidateQueries({ queryKey: ['task'] })
		}
	})
}
