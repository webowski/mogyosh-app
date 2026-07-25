import { View } from 'react-native'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import Animated from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'
import { getOrderedMarker } from '../model/block.utils'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type OrderedBlockProps = BlockProps & {
	depth: number
	orderIndex: number
	inputRefs?: BlockInputRefsMap
}

export default function OrderedBlock({
	data,
	depth,
	orderIndex,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: OrderedBlockProps) {
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
		blockType: 'ol'
	})

	const { theme } = useUnistyles()

	return (
		<View style={blockStyles.Ordered}>
			<Animated.Text style={[blockStyles.Ordered__marker, checkedStyle]}>
				{getOrderedMarker(depth, orderIndex)}
			</Animated.Text>
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
					activeColor={
						data.settings?.journaled ? theme.colors.success : undefined
					}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
