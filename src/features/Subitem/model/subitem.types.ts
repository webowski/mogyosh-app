import { SubitemEntity } from '@/shared/domain/task'

export type SubitemWithChildren = SubitemEntity & {
	children: SubitemWithChildren[]
}

export type SubitemType =
	| 'text'
	| 'heading'
	| 'bulleted'
	| 'numbered'
	| 'collapsible'
	| 'heading'
	| 'checklist'
	| 'metric'
	| 'image'
	| 'progress'
	| 'link'
	| 'timer'
	| 'counter'
