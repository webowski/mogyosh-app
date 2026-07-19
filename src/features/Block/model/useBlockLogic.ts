import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

import { isBlockCompletedOnDate } from '@/features/BlockState/model/blockState.utils'
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

	const [checked, setChecked] = useState(
		isBlockCompletedOnDate(data.states, selectedDate)
	)

	useEffect(() => {
		setChecked(isBlockCompletedOnDate(data.states, selectedDate))
	}, [data.states, selectedDate])

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

	const handlePressCheckbox = useCallback(
		() => {
			const newChecked = !checked
			setChecked(newChecked)
			updateBlockState.mutate({
				blockId: data.id,
				taskId: data.task_id,
				date: selectedDate,
				completed: newChecked
			})
			onCheckToggle?.(newChecked)
		},
		// eslint-disable-next-line
		[checked, selectedDate, data.id, data.task_id]
	)

	const handleFocus = () => setFocusedBlockId(data.id)

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
		if (pendingFocusId?.current === data.id) {
			pendingFocusId.current = null
			const ref = inputRef.current
			if (!ref) return
			focusInputElement(ref)
		}
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
