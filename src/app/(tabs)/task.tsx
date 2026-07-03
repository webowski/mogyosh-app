import { MaterialIcons } from '@expo/vector-icons'
import { useEffect } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { Pressable as GesturePressable } from 'react-native-gesture-handler'
import {
	KeyboardAwareScrollView,
	KeyboardController
} from 'react-native-keyboard-controller'
import Animated, {
	measure,
	runOnUI,
	scrollTo,
	useAnimatedRef,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useFrameCallback
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { useShallow } from 'zustand/react/shallow'

import {
	buildSubitemTree,
	DRAG_AUTOSCROLL_EDGE,
	DRAG_AUTOSCROLL_SPEED,
	DRAG_INDENT_STEP,
	dragSubitemState,
	flattenSubitemTree,
	SubitemNode,
	useCreateSubitem,
	useRemoveSubitem,
	useSubitems
} from '@/features/Subitem'
import { useSubitemStore } from '@/features/Subitem/model/subitem.store'
import { useSyncSubitems } from '@/features/Subitem/model/useSyncSubitems'
import { useTaskById } from '@/features/TaskList'
import type { SubitemId, TaskId } from '@/shared/domain/ids'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { useTaskStore } from '@/shared/model/task.store'
import { commonStyles, staticStyles, STYLE_VARS } from '@/shared/styles/common'

export default function TaskScreen() {
	const insets = useSafeAreaInsets()

	const { theme } = useUnistyles()
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
	const setActiveTaskId = useEditorToolbarStore(
		(state) => state.setActiveItemId
	)

	useEffect(
		() => {
			setActiveTaskId(selectedTaskId)
		},
		// eslint-disable-next-line
		[selectedTaskId]
	)

	const inputRefs = useEditorToolbarStore((state) => state.inputRefs)

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)

	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	// Load from server and sync into store
	const { isLoading: isLoadingSubitems } = useSubitems(selectedTaskId)

	// UI reads from Zustand store directly
	const subitems = useSubitemStore(
		useShallow((state) =>
			selectedTaskId ? (state.subitemsByTask[selectedTaskId] ?? []) : []
		)
	)

	// Start sync worker
	useSyncSubitems()

	const subitemTree = buildSubitemTree(subitems)

	const scrollAnimatedRef = useAnimatedRef<Animated.ScrollView>()

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			dragSubitemState.scrollY.value = event.contentOffset.y
		}
	})

	const measureContainer = () => {
		runOnUI(() => {
			'worklet'
			const measured = measure(scrollAnimatedRef)
			if (measured) {
				dragSubitemState.containerPageY.value = measured.pageY
			}
		})()
	}

	useEffect(() => {
		dragSubitemState.flatOrder.value = flattenSubitemTree(subitemTree)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subitems])

	const windowHeight = Dimensions.get('window').height

	useFrameCallback(() => {
		'worklet'
		if (!dragSubitemState.active.value) return

		const y = dragSubitemState.lastAbsoluteY.value
		if (y < DRAG_AUTOSCROLL_EDGE) {
			scrollTo(
				scrollAnimatedRef,
				0,
				dragSubitemState.scrollY.value - DRAG_AUTOSCROLL_SPEED,
				false
			)
		} else if (y > windowHeight - DRAG_AUTOSCROLL_EDGE) {
			scrollTo(
				scrollAnimatedRef,
				0,
				dragSubitemState.scrollY.value + DRAG_AUTOSCROLL_SPEED,
				false
			)
		}
	})

	const dropIndicatorStyle = useAnimatedStyle(() => {
		if (!dragSubitemState.active.value) return { opacity: 0 }

		const order = dragSubitemState.flatOrder.value
		const heights = dragSubitemState.rowHeights.value
		const dropIndex = dragSubitemState.dropIndex.value

		let cumulativeY = 0
		for (let i = 0; i < dropIndex && i < order.length; i++) {
			cumulativeY += heights[order[i].id] ?? 0
		}

		return {
			opacity: 1,
			transform: [
				{ translateY: cumulativeY },
				{ translateX: dragSubitemState.dropDepth.value * DRAG_INDENT_STEP }
			]
		}
	})

	const focusSubitem = (id: SubitemId) => {
		const ref = inputRefs.get(id)?.current
		if (!ref) return

		if (Platform.OS === 'web') {
			const element = ref as HTMLDivElement
			element.focus()
			const range = document.createRange()
			const selection = window.getSelection()
			range.selectNodeContents(element)
			range.collapse(false)
			selection?.removeAllRanges()
			selection?.addRange(range)
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).focus()
		}
	}

	const handleAddSubitem = (afterId?: SubitemId) => {
		const optimisticId = `optimistic-${Date.now()}` as SubitemId
		pendingFocusId.current = optimisticId

		createSubitem.mutate({
			info: '',
			task_id: selectedTaskId,
			parent_id: null,
			type: 'ul',
			optimisticId,
			afterId: afterId ?? null
		})
	}

	const handleRemove = (removeId: SubitemId) => {
		const index = subitems.findIndex((s) => s.id === removeId)
		const previousSubitem = index > 0 ? subitems[index - 1] : null

		if (previousSubitem) {
			focusSubitem(previousSubitem.id)
		}

		removeSubitem.mutate({ id: removeId, taskId: selectedTaskId as TaskId })
	}

	// Show loading state when waiting for task data
	if (isLoading || isLoadingSubitems)
		return (
			<View style={commonStyles.mainArea}>
				<ActivityIndicator />
			</View>
		)

	// Show error state
	if (error)
		return (
			<View style={commonStyles.mainArea}>
				<Text>
					Ошибка загрузки задачи:{' '}
					{error instanceof Error ? error.message : 'Неизвестная ошибка'}
				</Text>
			</View>
		)

	// Show not found state when no task data and not loading
	if (!data)
		return (
			<View style={commonStyles.mainArea}>
				<Text>Задача не найдена или не выбрана</Text>
			</View>
		)

	return (
		<>
			<KeyboardAwareScrollView
				ref={scrollAnimatedRef}
				ScrollViewComponent={Animated.ScrollView}
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				onLayout={measureContainer}
				style={staticStyles.ScrollBox}
				overScrollMode='never'
				bottomOffset={STYLE_VARS.editorToolbarHeight * 1.25}
			>
				<GesturePressable
					style={staticStyles.ScrollBox__inner}
					onPress={() => KeyboardController.dismiss()}
					accessibilityRole={undefined}
				>
					<View style={{ position: 'relative' }}>
						{subitemTree.map((subitemData) => (
							<SubitemNode
								inputRefs={inputRefs}
								key={subitemData.stableKey ?? subitemData.id}
								data={subitemData}
								depth={0}
								variant={subitemData.type}
								onAddAfter={handleAddSubitem}
								onRemove={handleRemove}
								pendingFocusId={pendingFocusId}
							/>
						))}
						<Animated.View
							pointerEvents='none'
							style={[styles.dropIndicator, dropIndicatorStyle]}
						/>
					</View>
					<Pressable
						style={[styles.addButton]}
						onPress={() => handleAddSubitem()}
					>
						<MaterialIcons name='add' size={28} color={theme.colors.minor} />
					</Pressable>
				</GesturePressable>
			</KeyboardAwareScrollView>
		</>
	)
}

const styles = StyleSheet.create((theme) => ({
	addButton: {
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
	},
	dropIndicator: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 2,
		borderRadius: 1,
		backgroundColor: theme.colors.minor
	}
}))
