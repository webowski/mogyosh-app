import {
	createContext,
	RefObject,
	useContext,
	useMemo,
	useRef,
	type ReactNode
} from 'react'
import Animated, {
	useAnimatedRef,
	type AnimatedRef
} from 'react-native-reanimated'

import { DRAG_SORT_DEFAULT_INDENT_STEP } from './dragSort.constants'
import { createDragSortState, type DragSortState } from './dragSort.state'
import type { DragSortDropPayload, DragSortId } from './dragSort.types'

type DragSortContextValue<TId extends DragSortId = DragSortId> = {
	state: DragSortState<TId>
	indentStep: number
	onDrop: (payload: DragSortDropPayload<TId>) => void
	containerRef: AnimatedRef<Animated.View>
	// Plain JS-thread-only staging object for accumulating row heights.
	// Kept OUTSIDE `state` on purpose: `state` is captured by worklets,
	// which freezes it into a shareable snapshot — a plain mutable object
	// must live separately to remain writable from handleLayout.
	rowHeightsStagingRef: RefObject<Record<string, number>>
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
	const containerRef = useAnimatedRef<Animated.View>()

	const rowHeightsStagingRef = useRef<Record<string, number>>({})

	const value = useMemo(
		() => ({
			state: stateRef.current,
			indentStep,
			onDrop,
			containerRef,
			rowHeightsStagingRef
		}),
		[indentStep, onDrop, containerRef]
	)

	return (
		<DragSortContext.Provider value={value as unknown as DragSortContextValue}>
			{children}
		</DragSortContext.Provider>
	)
}

export function useDragSortContext<TId extends DragSortId = DragSortId>() {
	const context = useContext(DragSortContext)
	if (!context) {
		throw new Error('useDragSortContext must be used within DragSortProvider')
	}
	return context as unknown as DragSortContextValue<TId>
}

export function useDragSortContainerRef<TId extends DragSortId = DragSortId>() {
	return useDragSortContext<TId>().containerRef
}
