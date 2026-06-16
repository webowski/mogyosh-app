import { SubitemId, SubitemStateId, TaskId } from './ids'
import { TaskState } from './task'

export type SubitemType =
	| 'p'
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'ul'
	| 'ol'
	| 'details'
	| 'table'
	| 'progress'
	| 'timer'
	| 'stopwatch'
	| 'counter'
	| 'image'

export type SubitemStatus = 'active' | 'completed' | 'archived'
export type SubitemState = 'done' | 'active' | 'archived'

export type SubitemStateEntity = {
	id: SubitemStateId
	task_id: TaskId
	state: TaskState
	state_date?: string | null
	created_at: string
}

export type SubitemSettings = {
	checkable?: boolean
	duration?: number
}

export type SubitemEntity = {
	id: SubitemId
	task_id: TaskId
	parent_id?: SubitemId | null
	type: SubitemType
	info: string
	status?: SubitemStatus
	settings: SubitemSettings
	priority?: number | null
	sort_order: any | null
	state?: SubitemState | null
	// schedules?: SubitemScheduleEntity[]
	created_at: string
	updated_at?: string | null
}

export type SubitemRow = {
	id: SubitemId
	task_id: TaskId
	parent_id: SubitemId | null
	type: SubitemType
	info: string
	settings: SubitemSettings
	status: SubitemStatus
	priority: number
	sort_order: any
	subitem_states: SubitemStateEntity[]
	// schedules: SubitemScheduleEntity[]
	created_at: string
	updated_at: string
}

export type SubitemInsert = {
	id: SubitemId
	info: string
	type: SubitemType
}
