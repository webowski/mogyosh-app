import { CategoryId, SubitemId, TaskId } from './ids'

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

export type TaskStatus = 'active' | 'completed' | 'archived'

export type TaskState = 'done' | 'active' | 'archived'

export type StateEntity = {
	id: string
	task_id: TaskId
	state: TaskState
	state_date?: string | null
	created_at: string
}

export type TaskType = 'task' | 'motivation'

export type TaskEntity = {
	id: TaskId
	info: string
	type: TaskType
	status?: TaskStatus
	state?: TaskState | null
	priority?: number | null
	category?: CategoryEntity | null
	parent_id?: TaskId | null
	schedules?: ScheduleEntity[]
	created_at: string
	updated_at?: string | null
}

export type TaskRow = {
	id: string
	info: string
	type: TaskType
	status: TaskStatus
	priority: number
	categories: any
	parent_id: string | null
	states: StateEntity[]
	schedules: ScheduleEntity[]
	created_at: string
	updated_at: string
}

export type SubitemType = 'check'
export type SubitemStatus = 'active' | 'completed' | 'archived'
export type SubitemState = 'done' | 'active' | 'archived'
export type SubitemStateEntity = {
	id: string
	task_id: TaskId
	state: TaskState
	state_date?: string | null
	created_at: string
}

export type SubitemEntity = {
	id: SubitemId
	task_id: TaskId
	parent_id?: SubitemId | null
	type: SubitemType
	info: string
	status?: SubitemStatus
	priority?: number | null
	sort_order: any
	state?: SubitemState | null
	// schedules?: SubitemScheduleEntity[]
	created_at: string
	updated_at?: string | null
}

export type SubitemRow = {
	id: string
	task_id: TaskId
	parent_id: string | null
	type: SubitemType
	info: string
	status: SubitemStatus
	priority: number
	sort_order: any
	subitem_states: SubitemStateEntity[]
	// schedules: SubitemScheduleEntity[]
	created_at: string
	updated_at: string
}
