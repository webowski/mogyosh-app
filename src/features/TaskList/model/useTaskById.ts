import { useQuery } from '@tanstack/react-query'

import type { TaskId } from '@/shared/domain/ids'
import { taskRepository } from '../repository/taskRepository'

export const useTaskById = (taskId: TaskId | null) => {
	return useQuery({
		queryKey: ['task', taskId],
		queryFn: () => taskRepository.getById(taskId!),
		enabled: !!taskId,
		retry: 2,
		staleTime: 5 * 60 * 1000
	})
}
