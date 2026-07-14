import { useEffect } from 'react'
import { ActivityIndicator, Platform, Text, View } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { useShallow } from 'zustand/react/shallow'

import { useMotivationItemId } from '@/features/Motivation'
import {
	buildSubitemTree,
	SubitemDragSortLayer,
	useCreateSubitem,
	useRemoveSubitem,
	useSubitems,
	useSubitemStore,
	useSyncSubitems
} from '@/features/Subitem'
import type { SubitemId, TaskId } from '@/shared/domain/ids'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { commonStyles } from '@/shared/styles/common'

export default function MotivationScreen() {
	const inputRefs = useEditorToolbarStore((state) => state.inputRefs)

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)
	const setActiveItemId = useEditorToolbarStore(
		(state) => state.setActiveItemId
	)

	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	// Resolve (or create) the exclusive motivation task
	const { data: motivationTaskId, isLoading: isLoadingMotivationTask } =
		useMotivationItemId()

	// Make this task the selected one while the screen is mounted
	useEffect(
		() => {
			if (motivationTaskId) setActiveItemId(motivationTaskId)
		},
		// eslint-disable-next-line
		[motivationTaskId]
	)

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

	const handleAddSubitem = (afterId?: SubitemId, initialText?: string) => {
		if (!motivationTaskId) return

		const optimisticId = `optimistic-${Date.now()}` as SubitemId
		pendingFocusId.current = optimisticId

		createSubitem.mutate({
			text_content: initialText ?? '',
			task_id: motivationTaskId,
			parent_id: null,
			type: 'p',
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
		<SubitemDragSortLayer
			subitemTree={subitemTree}
			taskId={motivationTaskId as TaskId}
			inputRefs={inputRefs}
			pendingFocusId={pendingFocusId}
			onAddSubitem={handleAddSubitem}
			onRemoveSubitem={handleRemove}
		/>
	)
}
