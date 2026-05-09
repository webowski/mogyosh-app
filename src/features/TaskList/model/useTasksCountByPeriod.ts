import { useQuery } from '@tanstack/react-query'

import { taskAPI } from '../repository/task.api'
import { CalendarDayData } from './task.types'

/**
 * Get task counts by day for a date range
 * Used for "Calendar" screen
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 */
export const useTasksCountByPeriod = (startDate: string, endDate: string) => {
	return useQuery({
		queryKey: ['tasks-count-period', startDate, endDate],
		queryFn: async () => {
			const countByDate = await taskAPI.getTasksCountByPeriod(
				startDate,
				endDate
			)

			// Convert to array of CalendarDayData
			const days: CalendarDayData[] = Object.entries(countByDate).map(
				([date, count]) => ({
					date,
					count: count as number,
					taskIds: []
				})
			)

			return { startDate, endDate, days }
		}
	})
}
