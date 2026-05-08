import { useMutation, useQueryClient } from '@tanstack/react-query'

import { taskRepository } from '../repository/taskRepository'

export const useCreateTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: taskRepository.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
		}
	})
}
