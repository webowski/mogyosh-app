import { useState } from 'react'
import { View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import type { SubitemId } from '@/shared/domain/ids'
import type {
	SubitemData,
	SubitemInputRefsMap,
	SubitemType
} from '@/shared/domain/subitem'
import { useDragSortRow } from '@/shared/modules/DragSort'
import { getOrderedSiblingIndex } from './model/subitem.utils'
import { useUpdateSubitemState } from './model/useUpdateSubitemState'
import BulletedSubitem from './variants/BulletedSubitem'
import CounterSubitem from './variants/CounterSubitem'
import ExpandableHeadingSubitem from './variants/ExpandableHeadingSubitem'
import ExpandableSubitem from './variants/ExpandableSubitem'
import HeadingSubitem from './variants/HeadingSubitem'
import OrderedSubitem from './variants/OrderedSubitem'
import ParagraphSubitem from './variants/ParagraphSubitem'
import StopwatchSubitem from './variants/StopwatchSubitem'
import TimerSubitem from './variants/TimerSubitem'

interface SubitemNodeProps {
	data: SubitemData
	depth: number
	variant: SubitemType
	siblings?: SubitemData[]
	inputRefs?: SubitemInputRefsMap
	onAddAfter?: (afterId: SubitemId) => void
	onRemove?: (id: SubitemId) => void
	pendingFocusId?: React.RefObject<SubitemId | null>
}

export default function SubitemNode({
	data,
	variant = 'p',
	depth = 0,
	siblings,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: SubitemNodeProps) {
	const [isChildShown, setIsChildShown] = useState(true)
	// const hasChildren = data.children.length > 0

	let HAS_CHECKBOX = true

	const { gesture, dragRowStyle, onLayout } = useDragSortRow(data.id, depth)

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
		case 'expandable':
			content = (
				<ExpandableSubitem
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

		case 'expandable-h1':
		case 'expandable-h2':
		case 'expandable-h3':
		case 'expandable-h4':
			content = (
				<ExpandableHeadingSubitem
					variant={variant}
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
					onExpandToggle={(expanded) => setIsChildShown(expanded)}
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
					orderIndex={getOrderedSiblingIndex(siblings ?? [data], data.id)}
					inputRefs={inputRefs}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
					onAddAfter={() => onAddAfter?.(data.id)}
					onRemove={() => onRemove?.(data.id)}
					pendingFocusId={pendingFocusId}
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
				<ParagraphSubitem
					data={data}
					onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
				/>
			)
	}

	return (
		<View style={{ paddingLeft: depth * 16 }}>
			<GestureDetector gesture={gesture}>
				<Animated.View style={dragRowStyle}>
					<View onLayout={onLayout} style={styles.subitem}>
						{content}
					</View>
					{isChildShown &&
						data.children.map((child) => (
							<SubitemNode
								inputRefs={inputRefs}
								key={child.id}
								data={child}
								depth={depth + 1}
								variant={child.type}
								siblings={data.children}
								onAddAfter={onAddAfter}
								onRemove={onRemove}
								pendingFocusId={pendingFocusId}
							/>
						))}
				</Animated.View>
			</GestureDetector>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	subitem: {
		borderRadius: 8
		// backgroundColor: theme.colors.thFill
	}
}))
