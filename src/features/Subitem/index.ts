export type {
	SubitemData,
	SubitemInputRefsMap,
	SubitemProps
} from '@/shared/domain/subitem'

export { default as EditorToolbar } from './EditorToolbar'
export { default as SubitemNode } from './SubitemNode'

export { subitemAPI } from './repository/subitem.api'

export { buildSubitemTree } from './model/subitem.utils'

export { useCreateSubitem } from './model/useCreateSubitem'
export { useMoveSubitem } from './model/useMoveSubitem'
export { useRemoveSubitem } from './model/useRemoveSubitem'
export { useSubitems } from './model/useSubitems'
export { useUpdateSubitem } from './model/useUpdateSubitem'
export { useUpdateSubitemState } from './model/useUpdateSubitemState'

export {
	DRAG_AUTOSCROLL_EDGE,
	DRAG_AUTOSCROLL_SPEED,
	DRAG_INDENT_STEP,
	DRAG_LONG_PRESS_MS,
	dragSubitemState
} from './model/dragSubitem.store'
export { computeDropTarget, flattenSubitemTree } from './model/subitem.utils'
export type { SubitemFlatEntry } from './model/subitem.utils'
export { reorderSubitem, useReorderSubitem } from './model/useReorderSubitem'
