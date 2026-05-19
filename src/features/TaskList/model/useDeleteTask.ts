import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskAPI } from '../repository/task.api'

export const useDeleteTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (taskId: string) => taskAPI.deleteTask(taskId),
		onSuccess: () => {
			// Invalidate related queries to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasksCountByPeriod'] })
			queryClient.invalidateQueries({ queryKey: ['tasksCountByDay'] })
		},
		onError: (error) => {
			console.error('Error deleting task:', error)
		}
	})
}
