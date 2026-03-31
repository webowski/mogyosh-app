import { createTask, getTasks } from '@/features/TaskList/model/task.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useTasks = () => {
	return useQuery({
		queryKey: ['tasks'],
		queryFn: getTasks
	})
}

export const useCreateTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
		}
	})
}
