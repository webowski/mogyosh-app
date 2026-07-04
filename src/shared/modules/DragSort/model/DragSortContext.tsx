import {
	createContext,
	useContext,
	useMemo,
	useRef,
	type ReactNode
} from 'react'

import { DRAG_SORT_DEFAULT_INDENT_STEP } from './dragSort.constants'
import { createDragSortState, type DragSortState } from './dragSort.state'
import type { DragSortDropPayload, DragSortId } from './dragSort.types'

type DragSortContextValue<TId extends DragSortId = DragSortId> = {
	state: DragSortState<TId>
	indentStep: number
	onDrop: (payload: DragSortDropPayload<TId>) => void
}

const DragSortContext = createContext<DragSortContextValue | null>(null)

type DragSortProviderProps<TId extends DragSortId> = {
	children: ReactNode
	onDrop: (payload: DragSortDropPayload<TId>) => void
	indentStep?: number
}

export function DragSortProvider<TId extends DragSortId = DragSortId>({
	children,
	onDrop,
	indentStep = DRAG_SORT_DEFAULT_INDENT_STEP
}: DragSortProviderProps<TId>) {
	const stateRef = useRef<DragSortState<TId>>(createDragSortState<TId>())

	const value = useMemo(
		() => ({ state: stateRef.current, indentStep, onDrop }),
		[indentStep, onDrop]
	)

	return (
		<DragSortContext.Provider value={value as DragSortContextValue}>
			{children}
		</DragSortContext.Provider>
	)
}

export function useDragSortContext<TId extends DragSortId = DragSortId>() {
	const context = useContext(DragSortContext)
	if (!context) {
		throw new Error('useDragSortContext must be used within DragSortProvider')
	}
	return context as DragSortContextValue<TId>
}
