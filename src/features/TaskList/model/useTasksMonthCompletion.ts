import { useQuery } from '@tanstack/react-query'

import { TaskId } from '@/shared/domain/ids'
import { taskAPI } from '../repository/task.api'
import { getMonthStart } from './task.bitmap'

/**
 * Fetches completion status for a set of tasks across all days of a month.
 * Intended for calendar month-grid views.
 */
export const useTasksMonthCompletion = (taskIds: TaskId[], month: Date) => {
	return useQuery({
		queryKey: ['tasks-month-completion', taskIds, getMonthStart(month)],
		queryFn: async () => await taskAPI.getTasksMonthCompletion(taskIds, month),
		enabled: taskIds.length > 0
	})
}
