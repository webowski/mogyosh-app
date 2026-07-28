import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { findUnitById } from '@/shared/domain/units'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
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
						<Text style={blockStyles.Counter__value}>50</Text>
						<Text style={blockStyles.Counter__units}>
							{findUnitById(data.settings?.units)
								? t(findUnitById(data.settings?.units)!.labelKey)
								: ''}
						</Text>
					</View>
					<View style={blockStyles.Counter}>
						<Text style={blockStyles.Counter__value}>10</Text>
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
