import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'

import { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { findUnitById } from '@/shared/domain/units'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useCounterValueSheetStore } from '../model/counterValueSheet.store'
import { useUnitSheetStore } from '../model/unitSheet.store'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

const VALUE_PICKER_MAX = 500
const COUNT_PICKER_MAX = 200

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
	const openCounterValueSheet = useCounterValueSheetStore((state) => state.open)
	const openUnitSheet = useUnitSheetStore((state) => state.open)

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

	const value = data.settings?.value ?? 0
	const count = data.settings?.count ?? 0

	const unitLabel = findUnitById(data.settings?.units)
		? t(findUnitById(data.settings?.units)!.labelKey)
		: t('units.selectPlaceholder')

	const handleOpenValuePicker = () => {
		openCounterValueSheet({
			blockId: data.id,
			taskId: data.task_id,
			field: 'value',
			title: findUnitById(data.settings?.units)
				? t(findUnitById(data.settings?.units)!.labelKey)
				: t('block.Current value'),
			maxValue: VALUE_PICKER_MAX
		})
	}

	const handleOpenCountPicker = () => {
		openCounterValueSheet({
			blockId: data.id,
			taskId: data.task_id,
			field: 'count',
			title: t('units.reps'),
			maxValue: COUNT_PICKER_MAX
		})
	}

	const handleOpenUnitSheet = () => {
		openUnitSheet({
			blockId: data.id,
			taskId: data.task_id
		})
	}

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
						<Pressable onPress={handleOpenValuePicker}>
							<Text style={blockStyles.Counter__value}>{value}</Text>
						</Pressable>
						<Pressable onPress={handleOpenUnitSheet}>
							<Text style={blockStyles.Counter__units}>{unitLabel}</Text>
						</Pressable>
					</View>
					<Pressable
						style={blockStyles.Counter}
						onPress={handleOpenCountPicker}
					>
						<Text style={blockStyles.Counter__value}>{count}</Text>
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
