import { useEffect, useMemo, useRef } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { log } from '@/shared/lib/development'
import { DRAG_SORT_LONG_PRESS_MS } from './dragSort.constants'
import type { DragSortId } from './dragSort.types'
import {
	computeDropTarget,
	recomputeDragSortDropTarget
} from './dragSort.utils'
import { useDragSortContext } from './DragSortContext'

export function useDragSortRow<TId extends DragSortId = DragSortId>(
	id: TId,
	depth: number
) {
	const { state, indentStep, onDrop, rowHeightsStagingRef } =
		useDragSortContext<TId>()
	const previousIdRef = useRef(id)

	useEffect(() => {
		if (previousIdRef.current !== id) {
			const previousHeight = state.rowHeights.value[previousIdRef.current]
			if (previousHeight !== undefined) {
				const nextHeights = { ...state.rowHeights.value }
				delete nextHeights[previousIdRef.current]
				nextHeights[id] = previousHeight
				state.rowHeights.value = nextHeights
			}
			previousIdRef.current = id
		}
	}, [id, state.rowHeights])

	const handleLayout = (e: LayoutChangeEvent) => {
		rowHeightsStagingRef.current[id] = e.nativeEvent.layout.height
		state.rowHeights.value = { ...rowHeightsStagingRef.current }
	}

	const commitDrop = (draggedId: TId, dropIndex: number, dropDepth: number) => {
		const target = computeDropTarget(
			state.flatOrder.value,
			draggedId,
			dropIndex,
			dropDepth
		)

		onDrop({ id: draggedId, ...target })
	}

	const gesture = useMemo(
		() =>
			Gesture.Pan()
				// .enabled(false) // DIAGNOSTIC: disable drag
				.activateAfterLongPress(DRAG_SORT_LONG_PRESS_MS)
				.onTouchesDown(() => {
					'worklet'
					scheduleOnRN(log, '[DragSort] onTouchesDown', id)
				})
				.onBegin(() => {
					'worklet'
					scheduleOnRN(log, '[DragSort] onBegin', id)
				})
				.onStart((e) => {
					'worklet'
					scheduleOnRN(log, '[DragSort] onStart (long press activated)', id)
					state.active.value = true
					state.draggedId.value = id
					state.draggedDepth.value = depth
					state.translateY.value = 0
					state.translateX.value = 0
					state.lastAbsoluteY.value = e.absoluteY

					const order = state.flatOrder.value
					const heights = state.rowHeights.value
					const draggedIndex = order.findIndex((entry) => entry.id === id)

					let originY = 0
					for (let i = 0; i < draggedIndex; i++) {
						originY += heights[order[i].id] ?? 0
					}

					state.dragOriginY.value = originY
					state.dragOwnHeight.value = heights[id] ?? 0
					// Finger offset within the row at the moment the drag started —
					// the indicator must track this point, not the row's center.
					state.dragPressOffsetY.value = e.y

					// Show the indicator at the item's own position immediately,
					// before the finger has moved.
					state.dropIndex.value = draggedIndex
					state.dropDepth.value = depth
				})
				.onUpdate((e) => {
					'worklet'
					state.translateY.value = e.translationY
					state.translateX.value = e.translationX
					state.lastAbsoluteY.value = e.absoluteY

					recomputeDragSortDropTarget(state, indentStep)
				})
				.onEnd(() => {
					'worklet'
					const draggedId = state.draggedId.value
					if (draggedId === null) return

					scheduleOnRN(
						commitDrop,
						draggedId,
						state.dropIndex.value,
						state.dropDepth.value
					)
				})
				.onFinalize(() => {
					'worklet'
					scheduleOnRN(log, '[DragSort] onFinalize', id)
					state.active.value = false
					state.draggedId.value = null
					state.dropIndex.value = -1
					state.translateY.value = withTiming(0)
					state.translateX.value = withTiming(0)
				}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[id, depth, indentStep, state]
	)

	const dragRowStyle = useAnimatedStyle(() => {
		const isDragged = state.draggedId.value === id
		const scrollCompensation = isDragged
			? state.scrollY.value - state.dragStartScrollY.value
			: 0

		return {
			transform: [
				{
					translateY: isDragged
						? state.translateY.value + scrollCompensation
						: 0
				},
				{ translateX: isDragged ? state.translateX.value : 0 }
			],
			zIndex: isDragged ? 10 : 0,
			opacity: isDragged ? 0.85 : 1
		}
	})

	return { gesture, dragRowStyle, onLayout: handleLayout }
}
