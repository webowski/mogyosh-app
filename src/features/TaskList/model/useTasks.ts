import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createTask, getTasks } from '@/features/TaskList/model/task.api'
import { TaskEntity } from '@/shared/domain/task'

export type TaskSection = {
	title: string
	data: TaskEntity[]
}

export const useTasks = () => {
	return useQuery({
		queryKey: ['tasks'],
		queryFn: async () => {
			const tasks = await getTasks()

			// Первые 3 задачи в секции "During the day", остальные в "By time"
			const duringDayTasks = tasks.slice(0, 3)
			const byTimeTasks = tasks.slice(3)

			const sections: TaskSection[] = []

			if (duringDayTasks.length > 0) {
				sections.push({
					title: 'During the day',
					data: duringDayTasks
				})
			}

			if (byTimeTasks.length > 0) {
				sections.push({
					title: 'By time',
					data: byTimeTasks
				})
			}

			return sections
		}
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
