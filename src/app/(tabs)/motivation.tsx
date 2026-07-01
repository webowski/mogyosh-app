import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useRef } from 'react'
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
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { useShallow } from 'zustand/react/shallow'

import { useMotivationTaskId } from '@/features/Motivation'
import {
	buildSubitemTree,
	SubitemNode,
	useCreateSubitem,
	useRemoveSubitem,
	useSubitems,
	type SubitemInputRefsMap
} from '@/features/Subitem'
import { useSubitemStore } from '@/features/Subitem/model/subitem.store'
import { useSyncSubitems } from '@/features/Subitem/model/useSyncSubitems'
import type { SubitemId } from '@/shared/domain/ids'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { useTaskStore } from '@/shared/model/task.store'
import { commonStyles, staticStyles, STYLE_VARS } from '@/shared/styles/common'

export default function MotivationScreen() {
	const { theme } = useUnistyles()
	const inputRefs = useRef<SubitemInputRefsMap>(new Map())
	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)
	const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId)

	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	// Resolve (or create) the exclusive motivation task
	const { data: motivationTaskId, isLoading: isLoadingMotivationTask } =
		useMotivationTaskId()

	// Make this task the selected one while the screen is mounted
	useEffect(() => {
		if (motivationTaskId) setSelectedTaskId(motivationTaskId)
		// eslint-disable-next-line
	}, [motivationTaskId])

	// Load from server and sync into store
	const { isLoading: isLoadingSubitems, error } = useSubitems(
		motivationTaskId ?? null
	)

	// UI reads from Zustand store directly
	const subitems = useSubitemStore(
		useShallow((state) =>
			motivationTaskId ? (state.subitemsByTask[motivationTaskId] ?? []) : []
		)
	)

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
		if (!motivationTaskId) return

		const optimisticId = `optimistic-${Date.now()}` as SubitemId
		pendingFocusId.current = optimisticId

		createSubitem.mutate({
			info: '',
			task_id: motivationTaskId,
			parent_id: null,
			type: 'ul',
			optimisticId,
			afterId: afterId ?? null
		})
	}

	const handleRemove = (removeId: SubitemId) => {
		if (!motivationTaskId) return

		const index = subitems.findIndex((s) => s.id === removeId)
		const previousSubitem = index > 0 ? subitems[index - 1] : null

		if (previousSubitem) {
			focusSubitem(previousSubitem.id)
		}

		removeSubitem.mutate({ id: removeId, taskId: motivationTaskId })
	}

	if (isLoadingMotivationTask || isLoadingSubitems)
		return (
			<View style={commonStyles.mainArea}>
				<ActivityIndicator />
			</View>
		)

	if (error)
		return (
			<View style={commonStyles.mainArea}>
				<Text>
					Ошибка загрузки:{' '}
					{error instanceof Error ? error.message : 'Неизвестная ошибка'}
				</Text>
			</View>
		)

	return (
		<>
			<KeyboardAwareScrollView
				style={staticStyles.ScrollBox}
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
							key={subitemData.stableKey ?? subitemData.id}
							data={subitemData}
							depth={0}
							variant={subitemData.type}
							onAddAfter={handleAddSubitem}
							onRemove={handleRemove}
							pendingFocusId={pendingFocusId}
						/>
					))}
					<Pressable
						style={[styles.AddButton]}
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
	AddButton: {
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
