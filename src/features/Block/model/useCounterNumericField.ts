import { useEffect, useRef, useState } from 'react'
import { Platform, type TextInput } from 'react-native'

import type { BlockEntity } from '@/shared/domain/block'
import { useBlurOnKeyboardHide } from '@/shared/lib/useBlurOnKeyboardHide'
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

	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const fieldTokenRef = useRef<symbol | null>(null)

	const [isFocused, setIsFocused] = useState(false)
	const [text, setText] = useState(String(data.settings?.[settingsKey] ?? 0))

	useBlurOnKeyboardHide(inputRef)

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

	const deactivate = (token: symbol) => {
		setIsFocused(false)
		useEditorToolbarStore.getState().setCustomInputFocused(false)
		useCounterAccessoryStore.getState().deactivate(token)
		if (
			useCounterAccessoryStore.getState().stepHandlerRef.current === handleStep
		) {
			useCounterAccessoryStore.getState().stepHandlerRef.current = null
		}
		commit(Number(text) || 0)
	}

	const handleFocus = () => {
		if (blurTimeoutRef.current) {
			clearTimeout(blurTimeoutRef.current)
			blurTimeoutRef.current = null
		}
		const token = Symbol('counter-field-focus')
		fieldTokenRef.current = token
		setIsFocused(true)
		useEditorToolbarStore.getState().setCustomInputFocused(true)
		useCounterAccessoryStore.getState().activate(token)

		if (Platform.OS !== 'web') {
			// KeyboardController.setFocusTo('current')
		}
	}

	const handleBlur = () => {
		const token = fieldTokenRef.current
		if (!token) return

		// If, by the time this runs, the store's activeToken is no longer
		// this one — either this same field was refocused (backspace glitch)
		// or another field took over — skip deactivating.
		blurTimeoutRef.current = setTimeout(() => {
			blurTimeoutRef.current = null

			// Emptying the field collapses it to 0 on blur (existing behaviour).
			// Refocus right after so `selectTextOnFocus` highlights the 0,
			// letting the user immediately type over it instead of tapping in
			// again and deleting a leading 0 manually.
			if (text === '') {
				deactivate(token)
				inputRef.current?.focus()
				setTimeout(() => {
					inputRef.current?.setSelection(0, 1)
				}, 100)
				return
			}

			deactivate(token)
		}, 80)
	}

	useEffect(() => {
		if (isFocused) {
			useCounterAccessoryStore.getState().stepHandlerRef.current = handleStep
		}
	})

	useEffect(
		() => {
			return () => {
				if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
				if (
					useCounterAccessoryStore.getState().stepHandlerRef.current ===
					handleStep
				) {
					useCounterAccessoryStore.getState().stepHandlerRef.current = null
				}
			}
		},
		// eslint-disable-next-line
		[]
	)

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
