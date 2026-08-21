import type { Ref, RefObject } from 'react'
import { useCallback } from 'react'
import {
	KeyboardAwareScrollView,
	type KeyboardAwareScrollViewRef
} from 'react-native-keyboard-controller'
import { AnimatedScrollViewComponent } from 'react-native-keyboard-controller/lib/typescript/components/ScrollViewWithBottomPadding'
import Animated from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { BlockData, BlockInputRefsMap } from '@/shared/domain/block'
import BlockNode from './BlockNode'
import { flattenBlockTree } from './model/block.utils'
import { reorderBlock } from './model/useReorderBlock'

import type { BlockId, TaskId } from '@/shared/domain/ids'
import {
	DragSortIndicator,
	DragSortProvider,
	useDragSortAutoScroll,
	useDragSortContainerRef,
	useDragSortScroll,
	useSyncDragSortFlatOrder,
	type DragSortDropPayload
} from '@/shared/modules/DragSort'
import { staticStyles, STYLE_VARS } from '@/shared/styles/common'
import BlockDraftAdd from './BlockDraftAdd'

type BlockDragSortLayerProps = {
	blockTree: BlockData[]
	taskId: TaskId
	inputRefs: BlockInputRefsMap
	pendingFocusId: RefObject<BlockId | null>
	onAddBlock: (afterId?: BlockId, initialText?: string) => void
	onRemoveBlock: (removeId: BlockId) => void
}

export function BlockDragSortLayer({
	blockTree,
	taskId,
	inputRefs,
	pendingFocusId,
	onAddBlock,
	onRemoveBlock
}: BlockDragSortLayerProps) {
	const handleDrop = useCallback(
		(payload: DragSortDropPayload<BlockId>) => {
			reorderBlock({
				id: payload.id,
				taskId,
				newParentId: payload.parentId,
				prevId: payload.prevId,
				nextId: payload.nextId
			})
		},
		[taskId]
	)

	return (
		<DragSortProvider onDrop={handleDrop}>
			<BlockDragSortContent
				blockTree={blockTree}
				inputRefs={inputRefs}
				pendingFocusId={pendingFocusId}
				onAddBlock={onAddBlock}
				onRemoveBlock={onRemoveBlock}
			/>
		</DragSortProvider>
	)
}

type BlockDragSortContentProps = Omit<BlockDragSortLayerProps, 'taskId'>

export function BlockDragSortContent({
	blockTree,
	inputRefs,
	pendingFocusId,
	onAddBlock,
	onRemoveBlock
}: BlockDragSortContentProps) {
	const { theme } = useUnistyles()

	const { scrollAnimatedRef, scrollHandler } = useDragSortScroll()
	useDragSortAutoScroll(scrollAnimatedRef)
	useSyncDragSortFlatOrder(flattenBlockTree(blockTree))
	const containerRef = useDragSortContainerRef()

	return (
		<KeyboardAwareScrollView
			ref={scrollAnimatedRef as unknown as Ref<KeyboardAwareScrollViewRef>}
			ScrollViewComponent={
				Animated.ScrollView as unknown as AnimatedScrollViewComponent
			}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			style={staticStyles.ScrollBox}
			overScrollMode='never'
			bottomOffset={STYLE_VARS.editorToolbarHeight * 1.25}
			keyboardDismissMode='on-drag'
			keyboardShouldPersistTaps='handled'
		>
			<Animated.View
				ref={containerRef}
				style={[staticStyles.ScrollBox__inner, { position: 'relative' }]}
				onTouchStart={() =>
					console.log('[BlockDragSort] container onTouchStart')
				}
			>
				{blockTree.map((blockData) => (
					<BlockNode
						inputRefs={inputRefs}
						key={blockData.stableKey ?? blockData.id}
						data={blockData}
						depth={0}
						variant={blockData.type}
						siblings={blockTree}
						onAddAfter={onAddBlock}
						onRemove={onRemoveBlock}
						pendingFocusId={pendingFocusId}
					/>
				))}
				<DragSortIndicator />
				{/* <Pressable style={[styles.ButtonAdd]} onPress={() => onAddBlock()}>
					<MaterialIcons name='add' size={28} color={theme.colors.minor} />
				</Pressable> */}
				<BlockDraftAdd
					onAddBlock={(initialText) => onAddBlock(undefined, initialText)}
				/>
			</Animated.View>
		</KeyboardAwareScrollView>
	)
}

const styles = StyleSheet.create((theme) => ({
	ButtonAdd: {
		marginTop: 4,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: theme.spacing.xs,
		backgroundColor: theme.colors.mutedSubtleFill,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_lg,
		borderBottomRightRadius: STYLE_VARS.radius_lg
	}
}))
