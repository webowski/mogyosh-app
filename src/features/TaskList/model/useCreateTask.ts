import { useMutation, useQueryClient } from '@tanstack/react-query'

import { taskAPI } from '../repository/task.api'

export const useCreateTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: taskAPI.createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
		}
	})
}
