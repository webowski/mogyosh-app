import { TaskId } from './ids'

export type TaskEntity = {
	id: TaskId
	title: string
	// schedule: []
}

export type TaskEntryEntity = {
	id: string
	taskId: TaskId
	startTime: string
	endTime: string
}
