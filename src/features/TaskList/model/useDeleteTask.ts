import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTaskStore } from '@/shared/model/task.store'
import { taskAPI } from '../repository/task.api'

export const useDeleteTask = () => {
	const queryClient = useQueryClient()
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
	const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId)

	return useMutation({
		mutationFn: (taskId: string) => taskAPI.deleteTask(taskId),
		onSuccess: (_, taskId) => {
			// Если удалили текущую выбранную задачу — сбрасываем selectedTaskId,
			// чтобы TaskScreen не пытался загрузить удалённую задачу
			if (selectedTaskId === taskId) {
				setSelectedTaskId(null)
			}

			// Удаляем кэш конкретной задачи
			queryClient.removeQueries({ queryKey: ['task', taskId] })

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
