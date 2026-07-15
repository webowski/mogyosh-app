import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'

import { BlockId, BlockStateId, TaskId } from './ids'
import { TaskState } from './task'

export type BlockType =
	| 'p'
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'ul'
	| 'ol'
	| 'expandable'
	| 'expandable-h1'
	| 'expandable-h2'
	| 'expandable-h3'
	| 'expandable-h4'
	| 'table'
	| 'progress'
	| 'timer'
	| 'stopwatch'
	| 'counter'
	| 'image'

export type BlockStatus = 'active' | 'archived'
export type BlockState = 'done' | 'active'

export type BlockStateEntity = {
	id: BlockStateId
	task_id: TaskId
	state: TaskState
	state_date?: string | null
	created_at: string
}

export type BlockSettings = {
	checkable?: boolean
	duration?: number
} | null

export type BlockEntity = {
	id: BlockId
	task_id: TaskId
	parent_id?: BlockId | null
	type: BlockType
	text_content: string
	status?: BlockStatus | null
	settings: BlockSettings
	priority?: number | null
	sort_order: string | null
	state?: BlockState | null
	// schedules?: BlockScheduleEntity[]
	created_at: string
	updated_at?: string | null
}

export type BlockRow = {
	id: BlockId
	task_id: TaskId
	parent_id: BlockId | null
	type: BlockType
	text_content: string
	settings: BlockSettings
	status: BlockStatus
	priority: number
	sort_order: string | null
	block_states: BlockStateEntity[]
	// schedules: BlockScheduleEntity[]
	created_at: string
	updated_at: string
}

export type BlockCreatePayload = {
	text_content: string
	type?: BlockType
	task_id?: string | null
	parent_id?: string | null
	optimisticId?: string
	sort_order?: string | null
}

export type BlockInsert = {
	id: BlockId
	text_content: string
	type: BlockType
}

export type BlockUpdate = {
	id: BlockId
	text_content?: string
	type?: BlockType
}

export type BlockData = BlockEntity & {
	children: BlockData[]
	stableKey?: string
}

export type BlockProps = {
	data: BlockData
	onCheckToggle?: (checked: boolean) => void
	onAddAfter?: () => void
	onRemove?: () => void
	pendingFocusId?: React.RefObject<BlockId | null>
}

export type BlockInputRef =
	| EnrichedMarkdownTextInputInstance
	| HTMLDivElement
	| null

export type BlockInputRefsMap = Map<BlockId, React.RefObject<BlockInputRef>>
