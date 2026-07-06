import type { LayoutChangeEvent } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { DRAG_SORT_LONG_PRESS_MS } from './dragSort.constants'
import type { DragSortId } from './dragSort.types'
import { computeDropTarget } from './dragSort.utils'
import { useDragSortContext } from './DragSortContext'

export function useDragSortRow<TId extends DragSortId = DragSortId>(
	id: TId,
	depth: number
) {
	const { state, indentStep, onDrop } = useDragSortContext<TId>()

	const handleLayout = (e: LayoutChangeEvent) => {
		state.rowHeights.value = {
			...state.rowHeights.value,
			[id]: e.nativeEvent.layout.height
		}
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

	const gesture = Gesture.Pan()
		.activateAfterLongPress(DRAG_SORT_LONG_PRESS_MS)
		.onStart((e) => {
			'worklet'
			state.active.value = true
			state.draggedId.value = id
			state.draggedDepth.value = depth
			state.translateY.value = 0
			state.translateX.value = 0

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

			const order = state.flatOrder.value
			const heights = state.rowHeights.value

			const draggedIndex = order.findIndex(
				(entry) => entry.id === state.draggedId.value
			)
			const draggedItemDepth =
				draggedIndex >= 0 ? order[draggedIndex].depth : -1
			let subtreeEnd = draggedIndex + 1
			while (
				subtreeEnd < order.length &&
				order[subtreeEnd].depth > draggedItemDepth
			) {
				subtreeEnd++
			}
			const isInSubtree = (index: number) =>
				draggedIndex >= 0 && index >= draggedIndex && index < subtreeEnd

			// Content-space finger position — scroll-invariant by construction.
			const virtualFingerY =
				state.dragOriginY.value + state.dragPressOffsetY.value + e.translationY

			let cumulativeY = 0
			let hoveredIndex = order.length
			for (let i = 0; i < order.length; i++) {
				const rowHeight = heights[order[i].id] ?? 0
				if (virtualFingerY < cumulativeY + rowHeight / 2) {
					hoveredIndex = i
					break
				}
				cumulativeY += rowHeight
			}
			state.dropIndex.value = hoveredIndex

			let prevEntry = null as (typeof order)[number] | null
			for (let i = hoveredIndex - 1; i >= 0; i--) {
				if (isInSubtree(i)) continue
				prevEntry = order[i]
				break
			}
			let nextEntry = null as (typeof order)[number] | null
			for (let i = hoveredIndex; i < order.length; i++) {
				if (isInSubtree(i)) continue
				nextEntry = order[i]
				break
			}

			const maxDepth = prevEntry ? prevEntry.depth + 1 : 0
			const minDepth = nextEntry ? nextEntry.depth : 0
			const rawDepth =
				state.draggedDepth.value + Math.round(e.translationX / indentStep)

			state.dropDepth.value = Math.max(minDepth, Math.min(rawDepth, maxDepth))
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
			state.active.value = false
			state.draggedId.value = null
			state.dropIndex.value = -1
			state.translateY.value = withTiming(0)
			state.translateX.value = withTiming(0)
		})

	const dragRowStyle = useAnimatedStyle(() => {
		const isDragged = state.draggedId.value === id
		return {
			transform: [
				{ translateY: isDragged ? state.translateY.value : 0 },
				{ translateX: isDragged ? state.translateX.value : 0 }
			],
			zIndex: isDragged ? 10 : 0,
			opacity: isDragged ? 0.85 : 1
		}
	})

	return { gesture, dragRowStyle, onLayout: handleLayout }
}
