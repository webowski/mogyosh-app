import { useState } from 'react'
import { View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import type {
	BlockData,
	BlockInputRefsMap,
	BlockType
} from '@/shared/domain/block'
import type { BlockId } from '@/shared/domain/ids'
import { useDragSortRow } from '@/shared/modules/DragSort'
import { getOrderedSiblingIndex } from './model/block.utils'
import { useUpdateBlockState } from './model/useUpdateBlockState'
import BulletedBlock from './variants/BulletedBlock'
import CounterBlock from './variants/CounterBlock'
import ExpandableBlock from './variants/ExpandableBlock'
import ExpandableHeadingBlock from './variants/ExpandableHeadingBlock'
import HeadingBlock from './variants/HeadingBlock'
import OrderedBlock from './variants/OrderedBlock'
import ParagraphBlock from './variants/ParagraphBlock'
import StopwatchBlock from './variants/StopwatchBlock'
import TimerBlock from './variants/TimerBlock'

interface BlockNodeProps {
	data: BlockData
	depth: number
	variant: BlockType
	siblings?: BlockData[]
	inputRefs?: BlockInputRefsMap
	onAddAfter?: (afterId: BlockId) => void
	onRemove?: (id: BlockId) => void
	pendingFocusId?: React.RefObject<BlockId | null>
}

export default function BlockNode({
	data,
	variant = 'p',
	depth = 0,
	siblings,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: BlockNodeProps) {
	const [isChildShown, setIsChildShown] = useState(true)
	// const hasChildren = data.children.length > 0

	let HAS_CHECKBOX = true

	const { gesture, dragRowStyle, onLayout } = useDragSortRow(data.id, depth)

	const updateBlockState = useUpdateBlockState()

	const handleToggleBlock = (blockId: BlockId, completed: boolean) => {
		updateBlockState.mutate({
			blockId,
			taskId: data.task_id,
			state: completed ? 'done' : 'active'
		})
	}

	let content

	switch (variant) {
		case 'expandable':
			content = (
				<ExpandableBlock
					data={data}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
					onExpandToggle={(expanded) => setIsChildShown(expanded)}
				/>
			)
			break

		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
			content = (
				<HeadingBlock
					variant={variant}
					data={data}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
				/>
			)
			break

		case 'expandable-h1':
		case 'expandable-h2':
		case 'expandable-h3':
		case 'expandable-h4':
			content = (
				<ExpandableHeadingBlock
					variant={variant}
					data={data}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
					onExpandToggle={(expanded) => setIsChildShown(expanded)}
				/>
			)
			break

		case 'ul':
			content = (
				<BulletedBlock
					data={data}
					depth={depth}
					inputRefs={inputRefs}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
					onAddAfter={() => onAddAfter?.(data.id)}
					onRemove={() => onRemove?.(data.id)}
					pendingFocusId={pendingFocusId}
				/>
			)
			break

		case 'ol':
			content = (
				<OrderedBlock
					data={data}
					depth={depth}
					orderIndex={getOrderedSiblingIndex(siblings ?? [data], data.id)}
					inputRefs={inputRefs}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
					onAddAfter={() => onAddAfter?.(data.id)}
					onRemove={() => onRemove?.(data.id)}
					pendingFocusId={pendingFocusId}
				/>
			)
			break

		case 'timer':
			content = (
				<TimerBlock
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
				/>
			)
			break

		case 'stopwatch':
			content = (
				<StopwatchBlock
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
				/>
			)
			break

		case 'counter':
			content = (
				<CounterBlock
					data={data}
					// depth={depth}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
				/>
			)
			break

		// case 'p':
		default:
			content = (
				<ParagraphBlock
					data={data}
					onCheckToggle={(checked) => handleToggleBlock(data.id, checked)}
				/>
			)
	}

	return (
		<View style={{ paddingLeft: depth * 16 }}>
			<GestureDetector gesture={gesture}>
				<Animated.View style={dragRowStyle}>
					<View onLayout={onLayout} style={styles.block}>
						{content}
					</View>
					{isChildShown &&
						data.children.map((child) => (
							<BlockNode
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
	block: {
		borderRadius: 8
		// backgroundColor: theme.colors.thFill
	}
}))
