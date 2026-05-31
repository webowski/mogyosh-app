import { SubitemId, TaskId } from './ids'
import { TaskState } from './task'

export type SubitemType =
	| 'text'
	| 'heading'
	| 'bulleted'
	| 'numbered'
	| 'collapsible'
	| 'heading'
	| 'metric'
	| 'image'
	| 'progress'
	| 'link'
	| 'timer'
	| 'counter'

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
