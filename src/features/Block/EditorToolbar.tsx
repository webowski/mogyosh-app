import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { ScrollView } from 'react-native-gesture-handler'
import {
	KeyboardToolbar,
	OverKeyboardView,
	useKeyboardState
} from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { useShallow } from 'zustand/react/shallow'

import { BlockType } from '@/shared/domain/block'
import type { BlockId, TaskId } from '@/shared/domain/ids'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import Animated from 'react-native-reanimated'
import { selectBlocks, useBlockStore } from './model/block.store'
import { useCreateBlock } from './model/useCreateBlock'
import { useMoveBlock } from './model/useMoveBlock'
import { useRemoveBlock } from './model/useRemoveBlock'
import { useUpdateBlock } from './model/useUpdateBlock'

const BLOCK_TYPE_OPTIONS: {
	type: BlockType
	icon: React.ComponentProps<typeof MaterialDesignIcons>['name']
	label: string
}[] = [
	{ type: 'p', icon: 'text', label: 'Paragraph' },
	{ type: 'ul', icon: 'format-list-bulleted-square', label: 'Bulleted list' },
	{ type: 'ol', icon: 'format-list-numbered', label: 'Numbered list' },
	{ type: 'expandable', icon: 'arrow-expand-vertical', label: 'Expandable' },
	{
		type: 'expandable-h1',
		icon: 'arrow-expand-vertical',
		label: 'Expandable Heading 1'
	},
	{
		type: 'expandable-h2',
		icon: 'arrow-expand-vertical',
		label: 'Expandable Heading 2'
	},
	{
		type: 'expandable-h3',
		icon: 'arrow-expand-vertical',
		label: 'Expandable Heading 3'
	},
	{
		type: 'expandable-h4',
		icon: 'arrow-expand-vertical',
		label: 'Expandable Heading 4'
	},
	{ type: 'timer', icon: 'timer', label: 'Timer' }
]

export default function EditorToolbar() {
	const { theme } = useUnistyles()

	const activeItemId = useEditorToolbarStore((state) => state.activeItemId)

	const focusedBlockId = useEditorToolbarStore((state) => state.focusedBlockId)

	const taskBlocks = useBlockStore(
		useShallow(selectBlocks(activeItemId as TaskId))
	)

	const inputRefs = useEditorToolbarStore((state) => state.inputRefs)

	const blocksForMove = taskBlocks

	const focusedBlock = blocksForMove.find((s) => s.id === focusedBlockId)
	const siblings = focusedBlock
		? blocksForMove.filter(
				(s) => (s.parent_id ?? null) === (focusedBlock.parent_id ?? null)
			)
		: []
	const siblingIndex = siblings.findIndex((s) => s.id === focusedBlockId)
	const canMoveUp = siblingIndex > 0
	const canMoveDown = siblingIndex >= 0 && siblingIndex < siblings.length - 1

	const moveBlock = useMoveBlock()

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

	const handleMoveUp = () => {
		if (!focusedBlockId) return
		// blurBlock(focusedBlockId) // см. ниже
		pushUndoAction({ type: 'move', id: focusedBlockId, direction: 'down' })
		moveBlock.mutate({
			id: focusedBlockId,
			taskId: activeItemId as TaskId,
			direction: 'up'
		})

		requestAnimationFrame(() =>
			requestAnimationFrame(() => focusBlock(focusedBlockId))
		)
	}
	const handleMoveDown = () => {
		if (!focusedBlockId) return
		pushUndoAction({ type: 'move', id: focusedBlockId, direction: 'up' })
		moveBlock.mutate({
			id: focusedBlockId,
			taskId: activeItemId as TaskId,
			direction: 'down'
		})

		requestAnimationFrame(() =>
			requestAnimationFrame(() => focusBlock(focusedBlockId))
		)
	}

	const blurBlock = (id: BlockId) => {
		const ref = inputRefs.get(id)?.current
		if (!ref) return
		if (Platform.OS === 'web') {
			;(ref as HTMLDivElement).blur()
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).blur()
		}
	}

	const removeBlock = useRemoveBlock()
	const handleRemove = () => {
		if (!focusedBlockId) return

		const blocks = selectBlocks(activeItemId)(useBlockStore.getState())
		const removedBlock = blocks.find((block) => block.id === focusedBlockId)

		if (removedBlock) {
			const siblings = blocks.filter(
				(block) =>
					(block.parent_id ?? null) === (removedBlock.parent_id ?? null)
			)
			const removedIndex = siblings.findIndex(
				(block) => block.id === focusedBlockId
			)
			const afterId = removedIndex > 0 ? siblings[removedIndex - 1].id : null

			pushUndoAction({ type: 'remove', removedBlock, afterId })
		}

		removeBlock.mutate({
			id: focusedBlockId,
			taskId: activeItemId as TaskId
		})
	}

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)
	const createBlock = useCreateBlock()
	const undoStack = useEditorToolbarStore((state) => state.undoStack)
	const pushUndoAction = useEditorToolbarStore((state) => state.pushUndoAction)
	const popUndoAction = useEditorToolbarStore((state) => state.popUndoAction)

	const handleAddBlock = () => {
		const blocks = selectBlocks(activeItemId)(useBlockStore.getState())
		const lastBlock = blocks[blocks.length - 1] ?? null

		const optimisticId = `optimistic-${Date.now()}` as BlockId
		pendingFocusId.current = optimisticId

		createBlock.mutate({
			text_content: '',
			task_id: activeItemId,
			parent_id: null,
			type: 'ul',
			optimisticId,
			afterId: lastBlock?.id ?? null
		})
	}

	const insets = useSafeAreaInsets()

	const { height: keyboardHeight } = useKeyboardState()

	const [blockTypeMenuMode, setBlockTypeMenuMode] = useState<
		'change' | 'add' | null
	>(null)
	const [isBlockTypeMenuOpen, setIsBlockTypeMenuOpen] = useState(false)

	const closeBlockTypeMenu = () => setIsBlockTypeMenuOpen(false)

	const openAddBlockMenu = () => {
		setBlockTypeMenuMode('add')
		setIsBlockTypeMenuOpen(true)
	}

	const openChangeBlockTypeMenu = () => {
		setBlockTypeMenuMode('change')
		setIsBlockTypeMenuOpen(true)
	}

	const updateBlock = useUpdateBlock()

	const currentTypeOption =
		BLOCK_TYPE_OPTIONS.find((option) => option.type === focusedBlock?.type) ??
		null

	const handleChangeBlockType = (type: BlockType) => {
		if (!focusedBlock) return

		pushUndoAction({
			type: 'update',
			id: focusedBlock.id,
			previousPatch: { type: focusedBlock.type }
		})

		updateBlock.mutate({
			id: focusedBlock.id,
			taskId: activeItemId as TaskId,
			patch: { type }
		})

		requestAnimationFrame(() =>
			requestAnimationFrame(() => focusBlock(focusedBlock.id))
		)
	}

	const handleAddBlockWithType = (type: BlockType) => {
		const blocks = selectBlocks(activeItemId)(useBlockStore.getState())
		const lastBlock = blocks[blocks.length - 1] ?? null

		const afterId = focusedBlock?.id ?? lastBlock?.id ?? null
		const parentId = focusedBlock?.parent_id ?? null

		const optimisticId = `optimistic-${Date.now()}` as BlockId
		pendingFocusId.current = optimisticId

		createBlock.mutate({
			text_content: '',
			task_id: activeItemId,
			parent_id: parentId,
			type,
			optimisticId,
			afterId
		})
	}

	const handleSelectBlockType = (type: BlockType) => {
		if (blockTypeMenuMode === 'change') handleChangeBlockType(type)
		if (blockTypeMenuMode === 'add') handleAddBlockWithType(type)
	}

	const handleUndo = () => {
		const action = popUndoAction()
		if (!action) return

		if (action.type === 'remove') {
			const optimisticId = `optimistic-${Date.now()}` as BlockId
			pendingFocusId.current = optimisticId

			createBlock.mutate({
				text_content: action.removedBlock.text_content,
				task_id: activeItemId,
				parent_id: action.removedBlock.parent_id,
				type: action.removedBlock.type,
				settings: action.removedBlock.settings,
				optimisticId,
				afterId: action.afterId
			})
		}

		if (action.type === 'update') {
			updateBlock.mutate({
				id: action.id,
				taskId: activeItemId as TaskId,
				patch: action.previousPatch
			})
		}

		if (action.type === 'move') {
			moveBlock.mutate({
				id: action.id,
				taskId: activeItemId as TaskId,
				direction: action.direction
			})
		}
	}

	return (
		<>
			<KeyboardToolbar>
				<KeyboardToolbar.Background>
					<View
						style={{
							backgroundColor: theme.colors.surfaceClosest,
							position: 'absolute',
							top: 0,
							left: 0,
							bottom: 0,
							right: 0
						}}
					/>
				</KeyboardToolbar.Background>

				<KeyboardToolbar.Content
					style={
						{
							// padding: 8
						}
					}
				>
					<ScrollView
						horizontal
						style={{}}
						bounces={false}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{
							// paddingHorizontal: 8,
							paddingHorizontal: STYLE_VARS.sidePadding,
							flexDirection: 'row',
							gap: 8
						}}
					>
						<Button variant='bare' onPress={openAddBlockMenu} preventFocusSteal>
							<MaterialDesignIcons
								name='plus-thick'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button
							variant='bare'
							onPress={openChangeBlockTypeMenu}
							disabled={!focusedBlock}
							preventFocusSteal
						>
							<MaterialDesignIcons
								name='swap-horizontal-bold'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button variant='bare' onPress={() => {}} preventFocusSteal>
							<MaterialDesignIcons
								name='pencil-box'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button
							variant='bare'
							disabled={!canMoveUp}
							onPress={handleMoveUp}
							preventFocusSteal
						>
							<MaterialDesignIcons
								name='arrow-up-bold'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button
							variant='bare'
							disabled={!canMoveDown}
							onPress={handleMoveDown}
							preventFocusSteal
						>
							<MaterialDesignIcons
								name='arrow-down-bold'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button variant='bare' onPress={handleRemove}>
							<MaterialDesignIcons
								name='delete-forever'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button
							variant='bare'
							disabled={undoStack.length === 0}
							onPress={handleUndo}
						>
							<MaterialDesignIcons
								name='arrow-u-left-top-bold'
								color={theme.colors.major}
								size={24}
							/>
						</Button>

						<Button variant='bare' onPress={() => {}}>
							B
						</Button>

						<Button variant='bare' onPress={() => {}}>
							I
						</Button>

						<Button variant='bare' onPress={() => {}}>
							<MaterialDesignIcons
								name='link'
								color={theme.colors.major}
								size={24}
							/>
						</Button>
					</ScrollView>
				</KeyboardToolbar.Content>
			</KeyboardToolbar>

			<OverKeyboardView visible={isBlockTypeMenuOpen}>
				<Pressable
					style={styles.TypeMenu__backdrop}
					onPress={closeBlockTypeMenu}
				/>
				<Animated.View
					style={[
						styles.TypeMenu,
						{
							bottom:
								STYLE_VARS.editorToolbarHeight +
								Math.max(keyboardHeight, insets.bottom)
						}
					]}
				>
					{BLOCK_TYPE_OPTIONS.map((option) => (
						<Pressable
							key={option.type}
							style={[
								styles.TypeMenu__row,
								option.type === focusedBlock?.type && styles.TypeMenu_row_active
							]}
							onPress={() => {
								handleSelectBlockType(option.type)
								closeBlockTypeMenu()
							}}
						>
							<MaterialDesignIcons
								name={option.icon}
								size={20}
								color={theme.colors.major}
							/>
							<Text style={styles.TypeMenu__label}>{option.label}</Text>
						</Pressable>
					))}
				</Animated.View>
			</OverKeyboardView>
		</>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	Toolbar__set: {
		paddingVertical: 8,
		paddingHorizontal: STYLE_VARS.sidePadding,
		flexDirection: 'row',
		gap: 8
	},

	TypeMenu__backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	},
	TypeMenu: {
		position: 'absolute',
		left: STYLE_VARS.sidePadding,
		backgroundColor: theme.colors.surface,
		borderRadius: STYLE_VARS.radius_md,
		borderWidth: 1,
		borderColor: theme.colors.borderSubtlest,
		boxShadow: theme.colors.shadeActionSheet,
		paddingVertical: 4,
		minWidth: 180
	},
	TypeMenu__row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 8,
		paddingHorizontal: 14
	},
	TypeMenu_row_active: {
		backgroundColor: theme.colors.surfaceDeep
	},
	TypeMenu__label: {
		fontSize: 14,
		lineHeight: 14 * 1.4,
		fontWeight: '500',
		color: theme.colors.major
	}
}))
