import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

import type {
	SubitemInputRefsMap,
	SubitemProps,
	SubitemType
} from '@/shared/domain/subitem'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { useCreateSubitem } from './useCreateSubitem'
import { useUpdateSubitem } from './useUpdateSubitem'

type UseSubitemLogicParams = SubitemProps & {
	inputRefs?: SubitemInputRefsMap
	subitemType: SubitemType
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

export function useSubitemLogic({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	pendingFocusId,
	subitemType
}: UseSubitemLogicParams) {
	const updateSubitem = useUpdateSubitem()
	const createSubitem = useCreateSubitem()

	const setFocusedSubitemId = useEditorToolbarStore(
		(state) => state.setFocusedSubitemId
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
				updateSubitem.mutate({
					id: data.id,
					taskId: data.task_id,
					patch: { text_content: value }
				})
			}, 500)
		},
		// eslint-disable-next-line
		[data.id]
	)

	const [checked, setChecked] = useState(data.state === 'done')
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
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	const handleFocus = () => setFocusedSubitemId(data.id)

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
		createSubitem.mutate({
			text_content: '',
			task_id: data.task_id,
			parent_id: data.parent_id ?? null,
			type: subitemType
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
