import { useEffect, useRef, useState } from 'react'
import type { TextInput } from 'react-native'

import type { BlockEntity } from '@/shared/domain/block'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { useCounterAccessoryStore } from './counterAccessory.store'
import { useUpdateBlock } from './useUpdateBlock'

// Editable numeric field for CounterBlock (used both for `value` and `count`
// settings). Wires up the field to the globally-mounted keyboard accessory
// with -1/+1 buttons (see CounterKeyboardAccessory).
export const useCounterNumericField = (
	data: BlockEntity,
	settingsKey: 'value' | 'count'
) => {
	const updateBlock = useUpdateBlock()
	const inputRef = useRef<TextInput>(null)

	const [isFocused, setIsFocused] = useState(false)
	const [text, setText] = useState(String(data.settings?.[settingsKey] ?? 0))

	useEffect(
		() => {
			if (!isFocused) setText(String(data.settings?.[settingsKey] ?? 0))
		},
		// eslint-disable-next-line
		[data.settings?.[settingsKey]]
	)

	const commit = (nextValue: number) => {
		setText(String(nextValue))
		updateBlock.mutate({
			id: data.id,
			taskId: data.task_id,
			patch: { settings: { ...data.settings, [settingsKey]: nextValue } }
		})
	}

	const handleChangeText = (nextText: string) => {
		setText(nextText)
		const parsedValue = Number(nextText)
		if (nextText !== '' && !Number.isNaN(parsedValue)) {
			updateBlock.mutate({
				id: data.id,
				taskId: data.task_id,
				patch: {
					settings: { ...data.settings, [settingsKey]: parsedValue }
				}
			})
		}
	}

	const handleStep = (step: number) => {
		const currentValue = Number(text) || 0
		commit(currentValue + step)
	}

	const handleFocus = () => {
		setIsFocused(true)
		useEditorToolbarStore.getState().setCustomInputFocused(true)
		useCounterAccessoryStore.getState().setActive(true)
	}

	const handleBlur = () => {
		setIsFocused(false)
		useEditorToolbarStore.getState().setCustomInputFocused(false)
		useCounterAccessoryStore.getState().setActive(false)
		useCounterAccessoryStore.getState().stepHandlerRef.current = null
		commit(Number(text) || 0)
	}

	useEffect(() => {
		if (isFocused) {
			useCounterAccessoryStore.getState().stepHandlerRef.current = handleStep
		}
	})

	useEffect(() => {
		return () => {
			if (
				useCounterAccessoryStore.getState().stepHandlerRef.current ===
				handleStep
			) {
				useCounterAccessoryStore.getState().stepHandlerRef.current = null
			}
		}
		// eslint-disable-next-line
	}, [])

	const triggerFocus = () => {
		if (!inputRef.current?.isFocused()) {
			inputRef.current?.focus()
		}
	}

	return {
		inputRef,
		text,
		handleFocus,
		handleBlur,
		handleChangeText,
		triggerFocus
	}
}
