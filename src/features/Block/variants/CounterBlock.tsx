import { useTranslation } from 'react-i18next'
import { Pressable, Text, TextInput, View } from 'react-native'

import { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { findUnitById } from '@/shared/domain/units'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { useCounterNumericField } from '../model/useCounterNumericField'
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

	const valueField = useCounterNumericField(data, 'value')
	const countField = useCounterNumericField(data, 'count')

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
					<Pressable
						style={blockStyles.Counter}
						onPress={valueField.triggerFocus}
					>
						<TextInput
							ref={valueField.inputRef}
							style={[
								blockStyles.Counter__value,
								blockStyles.Counter__valueInput
							]}
							value={valueField.text}
							keyboardType='number-pad'
							onFocus={valueField.handleFocus}
							selectTextOnFocus
							onBlur={valueField.handleBlur}
							onChangeText={valueField.handleChangeText}
						/>
						<Text style={blockStyles.Counter__units}>
							{findUnitById(data.settings?.units)
								? t(findUnitById(data.settings?.units)!.labelKey)
								: ''}
						</Text>
					</Pressable>
					<Pressable
						style={blockStyles.Counter}
						onPress={countField.triggerFocus}
					>
						<TextInput
							ref={countField.inputRef}
							style={[
								blockStyles.Counter__value,
								blockStyles.Counter__valueInput
							]}
							value={countField.text}
							keyboardType='number-pad'
							onFocus={countField.handleFocus}
							selectTextOnFocus
							onBlur={countField.handleBlur}
							onChangeText={countField.handleChangeText}
						/>
						<Text style={blockStyles.Counter__units}>{t('units.reps')}</Text>
					</Pressable>
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
