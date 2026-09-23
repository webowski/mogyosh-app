import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelTaskNotifications } from '@/services/Notifications'
import type { TaskId } from '@/shared/domain/ids'

import { scheduleAPI } from '../repository/schedule.api'

export const useDeleteSchedule = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (taskId: TaskId) => {
			await scheduleAPI.deleteSchedule(taskId)
			await cancelTaskNotifications(taskId)
		},
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
