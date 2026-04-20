import { TaskEntity } from '@/shared/domain/task'
import { TaskId } from '@/shared/domain/ids'

export type TaskFilters = {
	searchQuery?: string
	categoryId?: string
	status?: TaskEntity['status']
	priority?: number
}

export type TaskSection = {
	title: string
	data: TaskEntity[]
}

export type CalendarDayData = {
	date: string
	count: number
	taskIds: TaskId[]
}

export type CalendarPeriodData = {
	startDate: string
	endDate: string
	days: Record<string, CalendarDayData>
}

export type TasksByDate = {
	date: string
	tasks: TaskEntity[]
}
