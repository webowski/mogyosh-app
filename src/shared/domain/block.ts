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

export type CommonBlockSettings = {
	checkable?: boolean
	journaled?: boolean
	in_stats?: boolean
}

export type TimerDirection = 'increasing' | 'decreasing'

export type TimerBlockSettings = CommonBlockSettings & {
	duration?: number
	timerDirection?: TimerDirection
}

export type StopwatchBlockSettings = CommonBlockSettings & {
	duration?: number
}

export type CounterBlockSettings = CommonBlockSettings & {
	value?: number
	units?: string
	start?: number
	goal?: number

	count?: number
	countUnits?: string
	startCount?: number
	goalCount?: number
}

// Loose superset used across UI components (data.settings?.duration и т.п.) —
// какие поля реально есть, определяется block.type, а не типом на уровне TS
export type BlockSettings = CommonBlockSettings &
	Partial<TimerBlockSettings> &
	Partial<CounterBlockSettings>

export type BlockMonthStateEntity = {
	block_id: BlockId
	month: string | null // "2026-07-01"
	encoding: number
	state: string // hex-encoded bytea, e.g. "\\x01000200c301c2..."
	created_at: string
	updated_at: string
}

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
	states?: BlockMonthStateEntity[]
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
	settings: string // hex-encoded bytea, decoded via decodeBlockSettingsFromHex(type, settings)
	status: BlockStatus
	priority: number
	sort_order: string | null
	block_states: BlockMonthStateEntity[]
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
	onAddAfter?: (textAfterCursor?: string) => void
	onRemove?: () => void
	pendingFocusId?: React.RefObject<BlockId | null>
}

export type BlockInputRef =
	| EnrichedMarkdownTextInputInstance
	| HTMLDivElement
	| null

export type BlockInputRefsMap = Map<BlockId, React.RefObject<BlockInputRef>>
