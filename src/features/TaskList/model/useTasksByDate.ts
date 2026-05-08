import { useQuery } from '@tanstack/react-query'

import { taskRepository } from '../repository/taskRepository'

export const useTasksByDate = (date: string) => {
	return useQuery({
		queryKey: ['tasks-by-date', date],
		queryFn: () => taskRepository.getByDate(date)
	})
}
