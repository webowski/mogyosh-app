import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTaskStore } from '@/shared/model/task.store'
import { taskAPI } from '../repository/task.api'
import type { TaskSection } from './task.types'

export const useDeleteTaskPermanently = () => {
	const queryClient = useQueryClient()
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
	const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId)

	return useMutation({
		mutationFn: (taskId: string) => taskAPI.deleteTaskPermanently(taskId),
		onMutate: async (taskId: string) => {
			await queryClient.cancelQueries({ queryKey: ['tasks'] })

			const previousData = queryClient.getQueriesData<TaskSection[]>({
				queryKey: ['tasks']
			})

			return { previousData }
		},
		onSuccess: (_, taskId) => {
			if (selectedTaskId === taskId) {
				setSelectedTaskId(null)
			}

			queryClient.removeQueries({ queryKey: ['task', taskId] })

			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
			queryClient.invalidateQueries({ queryKey: ['tasksCountByPeriod'] })
			queryClient.invalidateQueries({ queryKey: ['tasksCountByDay'] })
		},
		onError: (error, _taskId, context) => {
			console.error('Error permanently deleting task:', error)

			context?.previousData.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data)
			})
		}
	})
}
