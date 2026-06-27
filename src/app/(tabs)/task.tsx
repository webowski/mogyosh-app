import { MaterialIcons } from '@expo/vector-icons'
import { useRef } from 'react'
import {
	ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
	buildSubitemTree,
	SubitemNode,
	useCreateSubitem,
	useRemoveSubitem,
	useSubitems,
	type SubitemInputRefsMap
} from '@/features/Subitem'
import {
	selectSubitems,
	useSubitemStore
} from '@/features/Subitem/model/subitem.store'
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
	const inputRefs = useRef<SubitemInputRefsMap>(new Map())

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)

	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	// Load from server and sync into store
	const { isLoading: isLoadingSubitems } = useSubitems(selectedTaskId)

	// UI reads from Zustand store directly
	const subitems = useSubitemStore(selectSubitems(selectedTaskId))

	// Start sync worker
	useSyncSubitems()

	const subitemTree = buildSubitemTree(subitems)

	const focusSubitem = (id: SubitemId) => {
		const ref = inputRefs.current.get(id)?.current
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

	// const keyboardOffset = useKeyboardOpening()
	// useEffect(() => {
	// 	console.log(keyboardOffset)
	// }, [keyboardOffset])

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
				style={staticStyles.ScrollBox}
				// contentContainerStyle={}
				overScrollMode='never'
				bottomOffset={STYLE_VARS.editorToolbarHeight * 1.25}
			>
				<GesturePressable
					style={staticStyles.ScrollBox__inner}
					onPress={() => KeyboardController.dismiss()}
					accessibilityRole={undefined}
				>
					{subitemTree.map((subitemData) => (
						<SubitemNode
							inputRefs={inputRefs.current}
							key={subitemData.id}
							data={subitemData}
							depth={0}
							variant={subitemData.type}
							onAddAfter={handleAddSubitem}
							onRemove={handleRemove}
							pendingFocusId={pendingFocusId}
						/>
					))}
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
	}
}))
