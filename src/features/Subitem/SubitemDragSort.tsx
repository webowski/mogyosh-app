import type { Ref, RefObject } from 'react'
import { useCallback } from 'react'
import { Pressable as GesturePressable } from 'react-native-gesture-handler'
import {
	KeyboardAwareScrollView,
	KeyboardController,
	type KeyboardAwareScrollViewRef
} from 'react-native-keyboard-controller'
import { AnimatedScrollViewComponent } from 'react-native-keyboard-controller/lib/typescript/components/ScrollViewWithBottomPadding'
import Animated from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { SubitemData, SubitemInputRefsMap } from '@/shared/domain/subitem'
import { flattenSubitemTree } from './model/subitem.utils'
import { reorderSubitem } from './model/useReorderSubitem'
import SubitemNode from './SubitemNode'

import type { SubitemId, TaskId } from '@/shared/domain/ids'
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
import SubitemDraftAdd from './SubitemDraftAdd'

type SubitemDragSortLayerProps = {
	subitemTree: SubitemData[]
	taskId: TaskId
	inputRefs: SubitemInputRefsMap
	pendingFocusId: RefObject<SubitemId | null>
	onAddSubitem: (afterId?: SubitemId, initialText?: string) => void
	onRemoveSubitem: (removeId: SubitemId) => void
}

export function SubitemDragSortLayer({
	subitemTree,
	taskId,
	inputRefs,
	pendingFocusId,
	onAddSubitem,
	onRemoveSubitem
}: SubitemDragSortLayerProps) {
	const handleDrop = useCallback(
		(payload: DragSortDropPayload<SubitemId>) => {
			reorderSubitem({
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
			<SubitemDragSortContent
				subitemTree={subitemTree}
				inputRefs={inputRefs}
				pendingFocusId={pendingFocusId}
				onAddSubitem={onAddSubitem}
				onRemoveSubitem={onRemoveSubitem}
			/>
		</DragSortProvider>
	)
}

type SubitemDragSortContentProps = Omit<SubitemDragSortLayerProps, 'taskId'>

export function SubitemDragSortContent({
	subitemTree,
	inputRefs,
	pendingFocusId,
	onAddSubitem,
	onRemoveSubitem
}: SubitemDragSortContentProps) {
	const { theme } = useUnistyles()

	const { scrollAnimatedRef, scrollHandler } = useDragSortScroll()
	useDragSortAutoScroll(scrollAnimatedRef)
	useSyncDragSortFlatOrder(flattenSubitemTree(subitemTree))
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
		>
			<GesturePressable
				style={staticStyles.ScrollBox__inner}
				onPress={() => KeyboardController.dismiss()}
				accessibilityRole={undefined}
				android_disableSound
			>
				<Animated.View ref={containerRef} style={{ position: 'relative' }}>
					{subitemTree.map((subitemData) => (
						<SubitemNode
							inputRefs={inputRefs}
							key={subitemData.stableKey ?? subitemData.id}
							data={subitemData}
							depth={0}
							variant={subitemData.type}
							siblings={subitemTree}
							onAddAfter={onAddSubitem}
							onRemove={onRemoveSubitem}
							pendingFocusId={pendingFocusId}
						/>
					))}
					<DragSortIndicator />
				</Animated.View>
				{/* <Pressable style={[styles.ButtonAdd]} onPress={() => onAddSubitem()}>
					<MaterialIcons name='add' size={28} color={theme.colors.minor} />
				</Pressable> */}
				<SubitemDraftAdd
					onAddSubitem={(initialText) => onAddSubitem(undefined, initialText)}
				/>
			</GesturePressable>
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
		backgroundColor: theme.colors.mutedLightFill,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_lg,
		borderBottomRightRadius: STYLE_VARS.radius_lg
	}
}))
