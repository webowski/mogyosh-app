import { CategoryId, TaskId } from './ids'

export type ScheduleType = 'once' | 'weekday' | 'daily' | 'weekly' | 'monthly'

export type ScheduleEntity = {
	id: string
	type: ScheduleType
	start_time?: string | null
	end_time?: string | null
	date?: string | null
	weekday?: number | null
	month_day?: number | null
	month?: number | null
	start_date?: string | null
	end_date?: string | null
}

export type CategoryEntity = {
	id: CategoryId
	name: string
	parent_id: CategoryId | null
}

export type TaskStatus = 'active' | 'completed' | 'archived'

export type TaskEntity = {
	id: TaskId
	info: string
	status?: TaskStatus
	priority?: number | null
	category?: CategoryEntity | null
	schedules?: ScheduleEntity[]
	created_at: string
	updated_at?: string | null
}

export type TaskRow = {
	id: string
	info: string
	status: TaskStatus
	priority: number
	categories: any
	schedules: ScheduleEntity[]
	created_at: string
	updated_at: string
}
