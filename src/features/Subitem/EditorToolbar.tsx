import { MaterialIcons } from '@expo/vector-icons'
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

import type { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemType } from '@/shared/domain/subitem'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import Animated from 'react-native-reanimated'
import { selectSubitems, useSubitemStore } from './model/subitem.store'
import { useCreateSubitem } from './model/useCreateSubitem'
import { useMoveSubitem } from './model/useMoveSubitem'
import { useRemoveSubitem } from './model/useRemoveSubitem'
import { useUpdateSubitem } from './model/useUpdateSubitem'

const BLOCK_TYPE_OPTIONS: {
	type: SubitemType
	icon: keyof typeof MaterialIcons.glyphMap
	label: string
}[] = [
	{ type: 'p', icon: 'notes', label: 'Paragraph' },
	{ type: 'ul', icon: 'format-list-bulleted', label: 'Bulleted list' },
	{ type: 'ol', icon: 'format-list-numbered', label: 'Numbered list' },
	{ type: 'expandable', icon: 'arrow-drop-down', label: 'Expandable' },
	{
		type: 'expandable-h1',
		icon: 'arrow-drop-down',
		label: 'Expandable Heading 1'
	},
	{
		type: 'expandable-h2',
		icon: 'arrow-drop-down',
		label: 'Expandable Heading 2'
	},
	{
		type: 'expandable-h3',
		icon: 'arrow-drop-down',
		label: 'Expandable Heading 3'
	},
	{
		type: 'expandable-h4',
		icon: 'arrow-drop-down',
		label: 'Expandable Heading 4'
	},
	{ type: 'timer', icon: 'timer', label: 'Timer' }
]

export default function EditorToolbar() {
	const { theme } = useUnistyles()

	const activeItemId = useEditorToolbarStore((state) => state.activeItemId)

	const focusedSubitemId = useEditorToolbarStore(
		(state) => state.focusedSubitemId
	)

	const taskSubitems = useSubitemStore(
		useShallow(selectSubitems(activeItemId as TaskId))
	)

	const inputRefs = useEditorToolbarStore((state) => state.inputRefs)

	const subitemsForMove = taskSubitems

	const focusedSubitem = subitemsForMove.find((s) => s.id === focusedSubitemId)
	const siblings = focusedSubitem
		? subitemsForMove.filter(
				(s) => (s.parent_id ?? null) === (focusedSubitem.parent_id ?? null)
			)
		: []
	const siblingIndex = siblings.findIndex((s) => s.id === focusedSubitemId)
	const canMoveUp = siblingIndex > 0
	const canMoveDown = siblingIndex >= 0 && siblingIndex < siblings.length - 1

	const moveSubitem = useMoveSubitem()

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

	const handleMoveUp = () => {
		if (!focusedSubitemId) return
		// blurSubitem(focusedSubitemId) // см. ниже
		moveSubitem.mutate({
			id: focusedSubitemId,
			taskId: activeItemId as TaskId,
			direction: 'up'
		})

		requestAnimationFrame(() =>
			requestAnimationFrame(() => focusSubitem(focusedSubitemId))
		)
	}
	const handleMoveDown = () => {
		if (!focusedSubitemId) return
		moveSubitem.mutate({
			id: focusedSubitemId,
			taskId: activeItemId as TaskId,
			direction: 'down'
		})

		requestAnimationFrame(() =>
			requestAnimationFrame(() => focusSubitem(focusedSubitemId))
		)
	}

	const blurSubitem = (id: SubitemId) => {
		const ref = inputRefs.get(id)?.current
		if (!ref) return
		if (Platform.OS === 'web') {
			;(ref as HTMLDivElement).blur()
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).blur()
		}
	}

	const removeSubitem = useRemoveSubitem()
	const handleRemove = () => {
		if (!focusedSubitemId) return
		removeSubitem.mutate({
			id: focusedSubitemId,
			taskId: activeItemId as TaskId
		})
	}

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)
	const createSubitem = useCreateSubitem()

	const handleAddSubitem = () => {
		const subitems = selectSubitems(activeItemId)(useSubitemStore.getState())
		const lastSubitem = subitems[subitems.length - 1] ?? null

		const optimisticId = `optimistic-${Date.now()}` as SubitemId
		pendingFocusId.current = optimisticId

		createSubitem.mutate({
			text_content: '',
			task_id: activeItemId,
			parent_id: null,
			type: 'ul',
			optimisticId,
			afterId: lastSubitem?.id ?? null
		})
	}

	const insets = useSafeAreaInsets()

	const { height: keyboardHeight } = useKeyboardState()

	const [blockTypeMenuMode, setBlockTypeMenuMode] = useState<
		'change' | 'add' | null
	>(null)
	const [isBlockTypeMenuOpen, setIsBlockTypeMenuOpen] = useState(false)

	const closeBlockTypeMenu = () => setIsBlockTypeMenuOpen(false)

	const openAddSubitemMenu = () => {
		setBlockTypeMenuMode('add')
		setIsBlockTypeMenuOpen(true)
	}

	const openChangeBlockTypeMenu = () => {
		setBlockTypeMenuMode('change')
		setIsBlockTypeMenuOpen(true)
	}

	const updateSubitem = useUpdateSubitem()

	const currentTypeOption =
		BLOCK_TYPE_OPTIONS.find((option) => option.type === focusedSubitem?.type) ??
		null

	const handleChangeBlockType = (type: SubitemType) => {
		if (!focusedSubitem) return

		updateSubitem.mutate({
			id: focusedSubitem.id,
			taskId: activeItemId as TaskId,
			patch: { type }
		})

		requestAnimationFrame(() =>
			requestAnimationFrame(() => focusSubitem(focusedSubitem.id))
		)
	}

	const handleAddSubitemWithType = (type: SubitemType) => {
		const subitems = selectSubitems(activeItemId)(useSubitemStore.getState())
		const lastSubitem = subitems[subitems.length - 1] ?? null

		const afterId = focusedSubitem?.id ?? lastSubitem?.id ?? null
		const parentId = focusedSubitem?.parent_id ?? null

		const optimisticId = `optimistic-${Date.now()}` as SubitemId
		pendingFocusId.current = optimisticId

		createSubitem.mutate({
			text_content: '',
			task_id: activeItemId,
			parent_id: parentId,
			type,
			optimisticId,
			afterId
		})
	}

	const handleSelectBlockType = (type: SubitemType) => {
		if (blockTypeMenuMode === 'change') handleChangeBlockType(type)
		if (blockTypeMenuMode === 'add') handleAddSubitemWithType(type)
	}

	return (
		<>
			<KeyboardToolbar>
				<KeyboardToolbar.Background>
					<View
						style={{
							backgroundColor: theme.colors.surface,
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
						<Button
							variant='bare'
							onPress={openAddSubitemMenu}
							preventFocusSteal
						>
							<MaterialIcons name='add' size={24} />
						</Button>

						<Button
							variant='bare'
							onPress={openChangeBlockTypeMenu}
							disabled={!focusedSubitem}
							preventFocusSteal
						>
							<MaterialIcons name='swap-horiz' size={24} />
						</Button>

						<Button variant='bare' onPress={() => {}} preventFocusSteal>
							<MaterialIcons name='edit-square' size={24} />
						</Button>

						<Button
							variant='bare'
							disabled={!canMoveUp}
							onPress={handleMoveUp}
							preventFocusSteal
						>
							<MaterialIcons name='arrow-upward' size={24} />
						</Button>

						<Button
							variant='bare'
							disabled={!canMoveDown}
							onPress={handleMoveDown}
							preventFocusSteal
						>
							<MaterialIcons name='arrow-downward' size={24} />
						</Button>

						<Button variant='bare' onPress={handleRemove}>
							<MaterialIcons name='delete' size={24} />
						</Button>

						<Button variant='bare' onPress={() => {}}>
							B
						</Button>

						<Button variant='bare' onPress={() => {}}>
							I
						</Button>

						<Button variant='bare' onPress={() => {}}>
							<MaterialIcons name='link' size={24} />
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
								option.type === focusedSubitem?.type &&
									styles.TypeMenu_row_active
							]}
							onPress={() => {
								handleSelectBlockType(option.type)
								closeBlockTypeMenu()
							}}
						>
							<MaterialIcons
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
		paddingVertical: 10,
		paddingHorizontal: 12
	},
	TypeMenu_row_active: {
		backgroundColor: theme.colors.surfaceAlter
	},
	TypeMenu__label: {
		fontSize: 14,
		color: theme.colors.major
	}
}))
