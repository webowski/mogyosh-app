import { View } from 'react-native'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { TEXT_VARS } from '@/shared/styles/text'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4'

const HEADING_SIZES: Record<HeadingVariant, number> = {
	h1: TEXT_VARS.h1,
	h2: TEXT_VARS.h2,
	h3: TEXT_VARS.h3,
	h4: TEXT_VARS.h4
}

type HeadingBlockProps = BlockProps & {
	variant: HeadingVariant
	inputRefs?: BlockInputRefsMap
	onExpandToggle: (expanded: boolean) => void
}

export default function HeadingBlock({
	variant,
	inputRefs,
	data,
	pendingFocusId,
	onCheckToggle,
	onAddAfter,
	onRemove
}: HeadingBlockProps) {
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
		blockType: variant
	})

	return (
		<View style={blockStyles.Expandible}>
			<MarkdownInput
				ref={inputRef}
				blockText={data.text_content}
				style={[{ flex: 1 }, checkedStyle]}
				textStyle={blockStyles.heading(HEADING_SIZES[variant])}
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
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
