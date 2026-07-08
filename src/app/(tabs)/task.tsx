import { useEffect } from 'react'
import { ActivityIndicator, Platform, Text, View } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { useShallow } from 'zustand/react/shallow'

import {
	buildSubitemTree,
	SubitemDragSortLayer,
	useCreateSubitem,
	useRemoveSubitem,
	useSubitems,
	useSubitemStore,
	useSyncSubitems
} from '@/features/Subitem'
import { useTaskById } from '@/features/TaskList'
import type { SubitemId, TaskId } from '@/shared/domain/ids'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { useTaskStore } from '@/shared/model/task.store'
import { commonStyles } from '@/shared/styles/common'

export default function TaskScreen() {
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
	const setActiveTaskId = useEditorToolbarStore(
		(state) => state.setActiveItemId
	)

	const inputRefs = useEditorToolbarStore((state) => state.inputRefs)

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)

	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	const { data, isLoading, error } = useTaskById(selectedTaskId)
	useEffect(
		() => {
			setActiveTaskId(selectedTaskId)
		},
		// eslint-disable-next-line
		[selectedTaskId]
	)

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
		const index = subitems.findIndex((subitem) => subitem.id === removeId)
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
		<SubitemDragSortLayer
			subitemTree={subitemTree}
			taskId={selectedTaskId as TaskId}
			inputRefs={inputRefs}
			pendingFocusId={pendingFocusId}
			onAddSubitem={handleAddSubitem}
			onRemoveSubitem={handleRemove}
		/>
	)
}
