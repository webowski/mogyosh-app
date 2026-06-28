import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'

import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'

export type SubitemData = SubitemEntity & {
	children: SubitemData[]
	stableKey?: string
}

export type SubitemProps = {
	data: SubitemData
	onCheckToggle?: (checked: boolean) => void
	onAddAfter?: () => void
	onRemove?: () => void
	pendingFocusId?: React.RefObject<SubitemId | null>
}

export type SubitemInputRef =
	| EnrichedMarkdownTextInputInstance
	| HTMLDivElement
	| null

export type SubitemInputRefsMap = Map<
	SubitemId,
	React.RefObject<SubitemInputRef>
>
