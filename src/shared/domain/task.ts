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

export type CategoryMap = Record<CategoryId, CategoryEntity | undefined>

export type TaskLifecycle = 'active' | 'archived' | 'deleted'

export type TaskState = 'done' | 'active'
export type TaskCompleted = boolean

export type StateEntity = {
	id: string
	task_id: TaskId
	state: TaskState
	completed: TaskCompleted
	created_at: string
}

export type MonthStateEntity = {
	task_id: TaskId
	month: string // "2026-07-01"
	completed: string // hex-encoded bytea, e.g. "\\x0000001f"
	created_at: string
	updated_at: string
}

export type TaskType = 'task' | 'motivation'

export type TaskEntity = {
	id: TaskId
	title: string
	type: TaskType
	lifecycle?: TaskLifecycle
	states?: MonthStateEntity[] // one row per month the task has interactions in
	priority?: number | null
	category?: CategoryEntity | null
	parent_id?: TaskId | null
	schedules?: ScheduleEntity[]
	sort_order?: string | null
	created_at: string
	updated_at?: string | null
}

export type TaskRow = {
	id: string
	title: string
	type: TaskType
	lifecycle: TaskLifecycle
	priority: number
	categories: any
	parent_id: string | null
	states: MonthStateEntity[]
	schedules: ScheduleEntity[]
	sort_order?: string | null
	created_at: string
	updated_at: string
}
