import { TaskId } from '@/shared/domain/ids'
import { CategoryEntity, TaskEntity, TaskStatus } from '@/shared/domain/task'

export type TaskFilters = {
	searchQuery?: string
	categoryId?: string | string[] | 'uncategorized'
	status?: TaskStatus
	priority?: number
	type?: 'task' | 'motivation'
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

export type TaskCategoryGroupEntity = {
	category: CategoryEntity
	tasks: TaskEntity[]
	children?: TaskCategoryGroupEntity[]
}
