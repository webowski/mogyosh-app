import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TextInput, View } from 'react-native'

import { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { findUnitById } from '@/shared/domain/units'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useCounterAccessoryStore } from '../model/counterAccessory.store'
import { useBlockLogic } from '../model/useBlockLogic'
import { useUpdateBlock } from '../model/useUpdateBlock'
import { blockStyles } from '../style'

type CounterBlockProps = BlockProps & {
	// onExpandToggle: (expanded: boolean) => void
	inputRefs?: BlockInputRefsMap
}

export default function CounterBlock({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: CounterBlockProps) {
	const { t } = useTranslation()

	const {
		inputRef,
		checked,
		checkedStyle,
		handleChangeText,
		handlePressCheckbox,
		handleFocus,
		handleAddAfter
	} = useBlockLogic({
		data,
		onCheckToggle,
		inputRefs,
		onAddAfter,
		pendingFocusId,
		blockType: 'counter'
	})

	const updateBlock = useUpdateBlock()
	const valueInputRef = useRef<TextInput>(null)

	const [isValueFocused, setIsValueFocused] = useState(false)
	const [valueText, setValueText] = useState(String(data.settings?.value ?? 0))

	useEffect(
		() => {
			if (!isValueFocused) setValueText(String(data.settings?.value ?? 0))
		},
		// eslint-disable-next-line
		[data.settings?.value]
	)

	const commitValue = (nextValue: number) => {
		setValueText(String(nextValue))
		updateBlock.mutate({
			id: data.id,
			taskId: data.task_id,
			patch: { settings: { ...data.settings, value: nextValue } }
		})
	}

	const handleValueChangeText = (text: string) => {
		setValueText(text)
		const parsedValue = Number(text)
		if (text !== '' && !Number.isNaN(parsedValue)) {
			updateBlock.mutate({
				id: data.id,
				taskId: data.task_id,
				patch: { settings: { ...data.settings, value: parsedValue } }
			})
		}
	}

	const handleValueBlur = () => {
		setIsValueFocused(false)
		useEditorToolbarStore.getState().setCustomInputFocused(false)
		useCounterAccessoryStore.getState().setActive(false)
		useCounterAccessoryStore.getState().stepHandlerRef.current = null
		commitValue(Number(valueText) || 0)
	}

	const handleStep = (step: number) => {
		const currentValue = Number(valueText) || 0
		commitValue(currentValue + step)
	}

	useEffect(() => {
		if (isValueFocused) {
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

	return (
		<View style={blockStyles.Penoblok}>
			<View style={blockStyles.Timer__body}>
				<MarkdownInput
					ref={inputRef}
					blockText={data.text_content}
					style={[{ flex: 1 }, checkedStyle]}
					textStyle={blockStyles.text}
					onChangeMarkdown={handleChangeText}
					onEnterPress={handleAddAfter}
					onFocus={handleFocus}
					onBackspaceOnEmpty={() => {
						onRemove?.()
					}}
				/>
				<View style={blockStyles.CounterSet}>
					<View style={blockStyles.Counter}>
						<TextInput
							ref={valueInputRef}
							style={[
								blockStyles.Counter__value,
								blockStyles.Counter__valueInput
							]}
							value={valueText}
							keyboardType='number-pad'
							onFocus={() => {
								setIsValueFocused(true)
								useEditorToolbarStore.getState().setCustomInputFocused(true)
								useCounterAccessoryStore.getState().setActive(true)
							}}
							selectTextOnFocus
							onBlur={handleValueBlur}
							onChangeText={handleValueChangeText}
						/>
						<Text style={blockStyles.Counter__units}>
							{findUnitById(data.settings?.units)
								? t(findUnitById(data.settings?.units)!.labelKey)
								: ''}
						</Text>
					</View>
					<View style={blockStyles.Counter}>
						<Text style={blockStyles.Counter__value}>
							{data.settings?.count}
						</Text>
						<Text style={blockStyles.Counter__units}>{t('units.reps')}</Text>
					</View>
				</View>
			</View>
			<View style={blockStyles.Timer__actions}>
				{data.settings?.checkable && (
					<Checkbox checked={checked} onPress={handlePressCheckbox} />
				)}
			</View>
		</View>
	)
}
