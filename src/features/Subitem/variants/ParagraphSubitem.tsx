import { View } from 'react-native'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useSubitemLogic } from '../model/useSubitemLogic'
import { subitemStyles } from '../style'

type ParagraphSubitemProps = SubitemProps & {
	inputRefs?: SubitemInputRefsMap
}

export default function ParagraphSubitem({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: ParagraphSubitemProps) {
	const {
		inputRef,
		checked,
		checkedStyle,
		handleChangeText,
		handlePressCheckbox,
		handleFocus,
		handleAddAfter
	} = useSubitemLogic({
		data,
		onCheckToggle,
		inputRefs,
		onAddAfter,
		pendingFocusId,
		subitemType: 'p'
	})

	return (
		<View style={subitemStyles.Paragraph}>
			<MarkdownInput
				ref={inputRef}
				subitemText={data.text_content}
				style={[{ flex: 1 }, checkedStyle]}
				textStyle={subitemStyles.text}
				onChangeMarkdown={handleChangeText}
				onEnterPress={handleAddAfter}
				onFocus={handleFocus}
				onBackspaceOnEmpty={() => {
					onRemove?.()
				}}
			/>
			{data.settings?.checkable && (
				<Checkbox
					style={subitemStyles.Block__checkbox}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
