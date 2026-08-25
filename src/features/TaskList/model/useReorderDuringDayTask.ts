import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TaskId } from '@/shared/domain/ids'
import type { TaskEntity } from '@/shared/domain/task'
import { taskAPI } from '../repository/task.api'
import type { TaskSection } from './task.types'

type ReorderDuringDayTaskVariables = {
	id: TaskId
	sortOrder: string
	prevId: TaskId | null
	nextId: TaskId | null
}

const reorderDuringDaySection = (
	data: TaskEntity[],
	variables: ReorderDuringDayTaskVariables
): TaskEntity[] => {
	const movedTask = data.find((task) => task.id === variables.id)
	if (!movedTask) return data

	const withoutMovedTask = data.filter((task) => task.id !== variables.id)

	const insertAfterIndex = variables.prevId
		? withoutMovedTask.findIndex((task) => task.id === variables.prevId)
		: variables.nextId
			? withoutMovedTask.findIndex((task) => task.id === variables.nextId) - 1
			: withoutMovedTask.length - 1

	const reorderedTask = { ...movedTask, sort_order: variables.sortOrder }
	const nextData = [...withoutMovedTask]
	nextData.splice(insertAfterIndex + 1, 0, reorderedTask)

	return nextData
}

export const useReorderDuringDayTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, sortOrder }: ReorderDuringDayTaskVariables) => {
			return await taskAPI.updateTaskSortOrder(id, sortOrder)
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ['tasks-grouped'] })

			const previous = queryClient.getQueriesData<TaskSection[]>({
				queryKey: ['tasks-grouped']
			})

			queryClient.setQueriesData<TaskSection[]>(
				{ queryKey: ['tasks-grouped'] },
				(old) =>
					old?.map((section) =>
						section.id === 'during_the_day'
							? {
									...section,
									data: reorderDuringDaySection(section.data, variables)
								}
							: section
					)
			)

			return { previous }
		},
		onError: (_error, _variables, context) => {
			context?.previous.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		}
	})
}
