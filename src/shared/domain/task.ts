import { TaskId } from './ids'

export type ScheduleEntity = {
	id: string
	type: 'once' | 'weekday' | 'daily' | 'weekly' | 'monthly'
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
	id: string
	name: string
	parent_id?: string | null
}

export type TaskEntity = {
	id: TaskId
	info: string
	status?: 'active' | 'completed' | 'archived'
	priority?: number | null
	category?: CategoryEntity | null
	schedules?: ScheduleEntity[]
	created_at: string
	updated_at?: string | null
}
