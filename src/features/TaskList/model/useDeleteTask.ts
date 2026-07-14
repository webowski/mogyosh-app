import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTaskStore } from '@/shared/model/task.store'
import { taskAPI } from '../repository/task.api'
import type { TaskSection } from './task.types'

export const useDeleteTask = () => {
	const queryClient = useQueryClient()
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
	const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId)

	return useMutation({
		mutationFn: (taskId: string) => taskAPI.deleteTask(taskId),
		onMutate: async (taskId: string) => {
			// Cancel outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey: ['tasks-grouped'] })

			const previousData = queryClient.getQueriesData<TaskSection[]>({
				queryKey: ['tasks-grouped']
			})

			// Optimistically remove the task from every cached "tasks-grouped" query
			queryClient.setQueriesData<TaskSection[]>(
				{ queryKey: ['tasks-grouped'] },
				(oldData) => {
					if (!oldData) return oldData

					return oldData
						.map((section) => ({
							...section,
							data: section.data.filter((task) => task.id !== taskId)
						}))
						.filter((section) => section.data.length > 0)
				}
			)

			return { previousData }
		},
		onSuccess: (_, taskId) => {
			// Если удалили текущую выбранную задачу — сбрасываем selectedTaskId,
			// чтобы TaskScreen не пытался загрузить удалённую задачу
			if (selectedTaskId === taskId) {
				setSelectedTaskId(null)
			}

			// Удаляем кэш конкретной задачи
			queryClient.removeQueries({ queryKey: ['task', taskId] })

			// Invalidate related queries to trigger refetch
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
			queryClient.invalidateQueries({ queryKey: ['tasksCountByPeriod'] })
			queryClient.invalidateQueries({ queryKey: ['tasksCountByDay'] })
		},
		onError: (error, _taskId, context) => {
			console.error('Error deleting task:', error)

			// Rollback optimistic update on failure
			context?.previousData.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data)
			})
		}
	})
}
