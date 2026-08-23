import { useEffect } from 'react'
import { ActivityIndicator, Platform, Text, View } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { useShallow } from 'zustand/react/shallow'

import {
	buildBlockTree,
	useBlocks,
	useBlockStore,
	useCreateBlock,
	useRemoveBlock,
	useSyncBlocks
} from '@/features/Block'
import { BlockDebugFlatList } from '@/features/Block/BlockDebugFlatList'
import { useTaskById } from '@/features/TaskList'
import type { BlockId, TaskId } from '@/shared/domain/ids'
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

	const createBlock = useCreateBlock()
	const removeBlock = useRemoveBlock()

	const { data, isLoading, error } = useTaskById(selectedTaskId)
	useEffect(
		() => {
			setActiveTaskId(selectedTaskId)
		},
		// eslint-disable-next-line
		[selectedTaskId]
	)

	// Load from server and sync into store
	const { isLoading: isLoadingBlocks } = useBlocks(selectedTaskId)

	// UI reads from Zustand store directly
	const blocks = useBlockStore(
		useShallow((state) =>
			selectedTaskId ? (state.blocksByTask[selectedTaskId] ?? []) : []
		)
	)

	// Start sync worker
	useSyncBlocks()

	const blockTree = buildBlockTree(blocks)

	const focusBlock = (id: BlockId) => {
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

	const handleAddBlock = (afterId?: BlockId, initialText?: string) => {
		const optimisticId = `optimistic-${Date.now()}` as BlockId
		pendingFocusId.current = optimisticId

		createBlock.mutate({
			text_content: initialText ?? '',
			task_id: selectedTaskId,
			parent_id: null,
			type: 'p',
			optimisticId,
			afterId: afterId ?? null
		})
	}

	const handleRemove = (removeId: BlockId) => {
		const index = blocks.findIndex((block) => block.id === removeId)
		const previousBlock = index > 0 ? blocks[index - 1] : null

		if (previousBlock) {
			focusBlock(previousBlock.id)
		}

		removeBlock.mutate({ id: removeId, taskId: selectedTaskId as TaskId })
	}

	// Show loading state when waiting for task data
	if (isLoading || isLoadingBlocks)
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

	return <BlockDebugFlatList blockTree={blockTree} />
	// {/* <BlockDragSortLayer
	// 	blockTree={blockTree}
	// 	taskId={selectedTaskId as TaskId}
	// 	inputRefs={inputRefs}
	// 	pendingFocusId={pendingFocusId}
	// 	onAddBlock={handleAddBlock}
	// 	onRemoveBlock={handleRemove}
	// /> #}
}
