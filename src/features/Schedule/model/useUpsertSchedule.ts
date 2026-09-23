import { useMutation, useQueryClient } from '@tanstack/react-query'

import { rescheduleTaskNotifications } from '@/services/Notifications'
import type { TaskId } from '@/shared/domain/ids'
import type { ScheduleData } from '@/shared/domain/task'

import { scheduleAPI } from '../repository/schedule.api'

type UpsertScheduleMutationParams = {
	taskId: TaskId
	data: ScheduleData
	title: string
}

export const useUpsertSchedule = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			taskId,
			data,
			title
		}: UpsertScheduleMutationParams) => {
			const result = await scheduleAPI.upsertSchedule({ taskId, data })
			await rescheduleTaskNotifications({
				taskId,
				title,
				scheduleData: data
			})
			return result
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
