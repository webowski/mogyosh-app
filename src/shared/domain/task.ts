import { CategoryId, TaskId } from './ids'

export type CategoryEntity = {
	id: CategoryId
	name: string
	parent_id: CategoryId | null
}

export type CategoryMap = Record<CategoryId, CategoryEntity | undefined>

/**
 * Жизненный цикл задачи:
 * - 'a': active (активная)
 * - 'ar': archived (архивная)
 * - 'd': deleted (удаленная)
 */
export type TaskLifecycle = 'a' | 'ar' | 'd'

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

export type TaskType =
	| 't' // task
	| 'm' // motivatioin

export type TaskEntity = {
	id: TaskId
	title: string
	type: TaskType
	lifecycle?: TaskLifecycle
	states?: MonthStateEntity[] // one row per month the task has interactions in
	priority?: number | null
	category?: CategoryEntity | null
	parent_id?: TaskId | null
	schedule?: ScheduleEntity | null
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
	schedule?: ScheduleEntity | null
	sort_order?: string | null
	created_at: string
	updated_at: string
}

// --- Schedule ---

/** Single time point. time = "HH:mm", endTime optional */
export type TimeSlot = {
	time: string
	endTime?: string | null
}

export type ScheduleRule =
	| {
			type: 'once'
			occurrences: {
				date: string
				time: string | null
				endTime?: string | null
			}[]
	  }
	| {
			type: 'daily'
			times: TimeSlot[]
			startDate?: string
			endDate?: string
	  }
	| {
			type: 'weekly'
			slots: {
				weekday: number // 0=Sun … 6=Sat
				time: string
				endTime?: string | null
			}[]
			startDate?: string
			endDate?: string
	  }
	| {
			type: 'monthly'
			occurrences: {
				dayOfMonth: number
				time: string | null
				endTime?: string | null
			}[]
			startDate?: string
			endDate?: string
	  }
	| {
			type: 'yearly'
			occurrences: {
				month: number // 1–12
				day: number
				time: string | null
				endTime?: string | null
			}[]
			startDate?: string
			endDate?: string
	  }

export type SchedulePayload = {
	rule: ScheduleRule
	/** Skipped dates (whole day). ISO "YYYY-MM-DD" */
	exceptions: string[]
}

export type ScheduleEntity = {
	taskId: string
	encoding: number
	payload: SchedulePayload
	createdAt: string
	updatedAt: string
}
