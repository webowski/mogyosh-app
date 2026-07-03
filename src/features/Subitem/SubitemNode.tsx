import { useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import type { SubitemId } from '@/shared/domain/ids'
import type {
	SubitemData,
	SubitemInputRefsMap,
	SubitemType
} from '@/shared/domain/subitem'
import {
	DRAG_INDENT_STEP,
	DRAG_LONG_PRESS_MS,
	dragSubitemState
} from './model/dragSubitem.store'
import { computeDropTarget } from './model/subitem.utils'
import { reorderSubitem } from './model/useReorderSubitem'
import { useUpdateSubitemState } from './model/useUpdateSubitemState'
import BulletedSubitem from './variants/BulletedSubitem'
import CollapsibleSubitem from './variants/CollapsibleSubitem'
import CounterSubitem from './variants/CounterSubitem'
import HeadingSubitem from './variants/HeadingSubitem'
import OrderedSubitem from './variants/OrderedSubitem'
import StopwatchSubitem from './variants/StopwatchSubitem'
import TextSubitem from './variants/TextSubitem'
import TimerSubitem from './variants/TimerSubitem'

interface SubitemNodeProps {
	data: SubitemData
	depth: number
	// onCheckToggle: (subitemId: SubitemId, checked: boolean) => void
	variant: SubitemType
	inputRefs?: SubitemInputRefsMap
	onAddAfter?: (afterId: SubitemId) => void
	onRemove?: (id: SubitemId) => void
	pendingFocusId?: React.RefObject<SubitemId | null>
}

export default function SubitemNode({
	data,
	variant = 'p',
	depth = 0,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: SubitemNodeProps) {
	const [isChildShown, setIsChildShown] = useState(true)
	// const hasChildren = data.children.length > 0

	let HAS_CHECKBOX = true

	const updateSubitemState = useUpdateSubitemState()

	const handleToggleSubitem = (subitemId: SubitemId, completed: boolean) => {
		updateSubitemState.mutate({
			subitemId,
			taskId: data.task_id,
			state: completed ? 'done' : 'active'
		})
	}

	let content

	switch (variant) {
		case 'details':
			content = (
				<CollapsibleSubitem
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
					onExpandToggle={(expanded) => setIsChildShown(expanded)}
				/>
			)
			break

		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
			content = (
				<HeadingSubitem
					variant={variant}
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'ul':
			content = (
				<BulletedSubitem
					data={data}
					depth={depth}
					inputRefs={inputRefs}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
					onAddAfter={() => onAddAfter?.(data.id)}
					onRemove={() => onRemove?.(data.id)}
					pendingFocusId={pendingFocusId}
				/>
			)
			break

		case 'ol':
			content = (
				<OrderedSubitem
					data={data}
					depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'timer':
			content = (
				<TimerSubitem
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'stopwatch':
			content = (
				<StopwatchSubitem
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		case 'counter':
			content = (
				<CounterSubitem
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
			break

		// case 'p':
		default:
			content = (
				<TextSubitem
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
	}

	// DRAG'N'DROP
	const handleRowLayout = (e: LayoutChangeEvent) => {
		dragSubitemState.rowHeights.value = {
			...dragSubitemState.rowHeights.value,
			[data.id]: e.nativeEvent.layout.height
		}
	}

	const commitDrop = () => {
		const id = dragSubitemState.draggedId.value
		if (!id) return

		const { parentId, prevId, nextId } = computeDropTarget(
			dragSubitemState.flatOrder.value,
			id,
			dragSubitemState.dropIndex.value,
			dragSubitemState.dropDepth.value
		)

		reorderSubitem({
			id,
			taskId: data.task_id,
			newParentId: parentId,
			prevId,
			nextId
		})
	}

	const dragGesture = Gesture.Pan()
		.activateAfterLongPress(DRAG_LONG_PRESS_MS)
		.onStart(() => {
			'worklet'
			dragSubitemState.active.value = true
			dragSubitemState.draggedId.value = data.id
			dragSubitemState.draggedDepth.value = depth
			dragSubitemState.translateY.value = 0
			dragSubitemState.translateX.value = 0
		})
		.onUpdate((e) => {
			'worklet'
			dragSubitemState.translateY.value = e.translationY
			dragSubitemState.translateX.value = e.translationX
			dragSubitemState.lastAbsoluteY.value = e.absoluteY

			const order = dragSubitemState.flatOrder.value
			const heights = dragSubitemState.rowHeights.value

			const draggedIndex = order.findIndex(
				(entry) => entry.id === dragSubitemState.draggedId.value
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

			const absoluteContentY =
				e.absoluteY -
				dragSubitemState.containerPageY.value +
				dragSubitemState.scrollY.value

			let cumulativeY = 0
			let hoveredIndex = order.length
			for (let i = 0; i < order.length; i++) {
				const rowHeight = heights[order[i].id] ?? 0
				if (absoluteContentY < cumulativeY + rowHeight / 2) {
					hoveredIndex = i
					break
				}
				cumulativeY += rowHeight
			}
			dragSubitemState.dropIndex.value = hoveredIndex

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
				dragSubitemState.draggedDepth.value +
				Math.round(e.translationX / DRAG_INDENT_STEP)

			dragSubitemState.dropDepth.value = Math.max(
				minDepth,
				Math.min(rawDepth, maxDepth)
			)
		})
		.onEnd(() => {
			'worklet'
			scheduleOnRN(commitDrop)
		})
		.onFinalize(() => {
			'worklet'
			dragSubitemState.active.value = false
			dragSubitemState.draggedId.value = null
			dragSubitemState.dropIndex.value = -1
			dragSubitemState.translateY.value = withTiming(0)
			dragSubitemState.translateX.value = withTiming(0)
		})

	const dragRowStyle = useAnimatedStyle(() => {
		const isDragged = dragSubitemState.draggedId.value === data.id
		return {
			transform: [
				{ translateY: isDragged ? dragSubitemState.translateY.value : 0 },
				{ translateX: isDragged ? dragSubitemState.translateX.value : 0 }
			],
			zIndex: isDragged ? 10 : 0,
			opacity: isDragged ? 0.85 : 1
		}
	})

	return (
		<View style={{ paddingLeft: depth * 16 }}>
			<GestureDetector gesture={dragGesture}>
				<Animated.View onLayout={handleRowLayout} style={dragRowStyle}>
					{content}
				</Animated.View>
			</GestureDetector>

			{isChildShown &&
				data.children.map((child) => (
					<SubitemNode
						inputRefs={inputRefs}
						key={child.id}
						data={child}
						depth={depth + 1}
						variant={child.type}
						onAddAfter={onAddAfter}
						onRemove={onRemove}
						pendingFocusId={pendingFocusId}
					/>
				))}
		</View>
	)
}
