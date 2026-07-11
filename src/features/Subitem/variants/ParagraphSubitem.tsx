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
				subitemText={data.info}
				onChangeMarkdown={handleChangeText}
				onEnterPress={handleAddAfter}
				onFocus={handleFocus}
				style={[subitemStyles.text, checkedStyle]}
				onBackspaceOnEmpty={() => {
					onRemove?.()
				}}
			/>
			{data.settings?.checkable && (
				<Checkbox checked={checked} onPress={handlePressCheckbox} />
			)}
		</View>
	)
}
