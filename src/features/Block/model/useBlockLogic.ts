import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { KeyboardController } from 'react-native-keyboard-controller'
import {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

import { isBlockChecked } from '@/features/BlockState/model/blockState.utils'
import type {
	BlockInputRefsMap,
	BlockProps,
	BlockType
} from '@/shared/domain/block'
import { useCalendarStore } from '@/shared/model/calendar.store'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { useCreateBlock } from './useCreateBlock'
import { useUpdateBlock } from './useUpdateBlock'
import { useUpdateBlockPersistentState } from './useUpdateBlockPersistentState'
import { useUpdateBlockState } from './useUpdateBlockState'

type UseBlockLogicParams = BlockProps & {
	inputRefs?: BlockInputRefsMap
	blockType: BlockType
}

function focusInputElement(
	ref: EnrichedMarkdownTextInputInstance | HTMLDivElement
) {
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

export function useBlockLogic({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	pendingFocusId,
	blockType
}: UseBlockLogicParams) {
	const updateBlock = useUpdateBlock()
	const createBlock = useCreateBlock()

	const setFocusedBlockId = useEditorToolbarStore(
		(state) => state.setFocusedBlockId
	)

	const getOrCreateRef = () => {
		if (!inputRefs) return { current: null }
		if (!inputRefs.has(data.id)) {
			inputRefs.set(data.id, { current: null })
		}
		return inputRefs.get(data.id)!
	}

	const inputRef = getOrCreateRef()

	const updateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const handleChangeText = useCallback(
		(value: string) => {
			if (updateDebounceRef.current) clearTimeout(updateDebounceRef.current)
			updateDebounceRef.current = setTimeout(() => {
				updateBlock.mutate({
					id: data.id,
					taskId: data.task_id,
					patch: { text_content: value }
				})
			}, 500)
		},
		// eslint-disable-next-line
		[data.id]
	)

	const selectedDate = useCalendarStore((store) => store.selectedDate)
	const updateBlockState = useUpdateBlockState()
	const updateBlockPersistentState = useUpdateBlockPersistentState()

	const isJournaled = data.settings?.journaled ?? false

	const [checked, setChecked] = useState(isBlockChecked(data, selectedDate))

	useEffect(
		() => {
			const nextChecked = isBlockChecked(data, selectedDate)
			// console.log('[DEBUG resync effect]', {
			// 	blockId: data.id,
			// 	nextChecked,
			// 	statesRef: data.states,
			// 	time: Date.now()
			// })
			setChecked(nextChecked)
		},
		// eslint-disable-next-line
		[data.states, data.settings, selectedDate]
	)

	const animationProgress = useSharedValue(checked ? 1 : 0)
	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)
	const checkedStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? STYLE_VARS.checkedOpacity : 1, {
			duration: STYLE_VARS.duration.md
		})
	}))

	const buildCheckboxStatePayload = (checked: boolean): unknown =>
		blockType === 'counter'
			? { value: data.settings?.value ?? 0, completed: checked }
			: checked

	const handlePressCheckbox = useCallback(
		() => {
			const newChecked = !checked
			// console.log('[DEBUG press]', {
			// 	blockId: data.id,
			// 	checkedBefore: checked,
			// 	newChecked,
			// 	time: Date.now()
			// })
			setChecked(newChecked)

			if (isJournaled) {
				const isCounterUncheck = blockType === 'counter' && !newChecked

				updateBlockState.mutate({
					blockId: data.id,
					blockType,
					taskId: data.task_id,
					date: selectedDate,
					state: isCounterUncheck ? null : buildCheckboxStatePayload(newChecked)
				})
			} else {
				updateBlockPersistentState.mutate({
					blockId: data.id,
					taskId: data.task_id,
					blockType,
					state: buildCheckboxStatePayload(newChecked)
				})
			}

			onCheckToggle?.(newChecked)
		},
		// eslint-disable-next-line
		[
			checked,
			isJournaled,
			selectedDate,
			data.id,
			data.task_id,
			data.settings?.value,
			blockType
		]
	)

	const handleFocus = () => {
		setFocusedBlockId(data.id)

		// On Android, when the row is wrapped in a Pan gesture (drag-sort),
		// the first tap can end up giving the input native focus (cursor
		// blinks) without the soft keyboard actually showing — the second
		// tap is what used to open it. setFocusTo('current') is a no-op if
		// the keyboard is already visible, and forces it open otherwise.
		// Defer until after the current touch ends so the native caret
		// position from the tap is not overwritten.
		if (Platform.OS !== 'web') {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (!KeyboardController.isVisible()) {
						// KeyboardController.setFocusTo('current')
					}
				})
			})
		}
	}

	const focusNewInput = () => {
		const ref = inputRef.current
		if (!ref) return
		focusInputElement(ref)
	}

	const handleAddAfter = () => {
		if (onAddAfter) {
			onAddAfter()
			return
		}

		// Fallback: create directly if no onAddAfter provided (standalone usage)
		createBlock.mutate({
			text_content: '',
			task_id: data.task_id,
			parent_id: data.parent_id ?? null,
			type: blockType
		})
		setTimeout(focusNewInput, 50)
	}

	useEffect(() => {
		if (pendingFocusId?.current !== data.id) return

		pendingFocusId.current = null

		const tryFocus = () => {
			const currentRef = inputRef.current
			if (!currentRef) return false
			focusInputElement(currentRef)
			return true
		}

		if (tryFocus()) return

		const timeoutId = setTimeout(() => {
			tryFocus()
		}, 50)

		return () => clearTimeout(timeoutId)
	}, [data.id, pendingFocusId, inputRef])

	return {
		inputRef,
		checked,
		checkedStyle,
		handleChangeText,
		handlePressCheckbox,
		handleFocus,
		handleAddAfter
	}
}
