import { View } from 'react-native'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type ParagraphBlockProps = BlockProps & {
	inputRefs?: BlockInputRefsMap
}

export default function ParagraphBlock({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: ParagraphBlockProps) {
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
		blockType: 'p'
	})

	return (
		<View style={blockStyles.Paragraph}>
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
			{data.settings?.checkable && (
				<Checkbox
					style={blockStyles.Block__checkbox}
					appearance={data.settings?.journaled ? 'success' : 'default'}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
