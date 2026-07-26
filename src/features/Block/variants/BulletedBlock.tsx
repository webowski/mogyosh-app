import { View } from 'react-native'
import Animated from 'react-native-reanimated'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { getBulletedMarker } from '../model/block.utils'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type BulletedBlockProps = BlockProps & {
	depth: number
	inputRefs?: BlockInputRefsMap
}

export default function BulletedBlock({
	data,
	depth,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: BulletedBlockProps) {
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
		blockType: 'ul'
	})

	return (
		<View style={blockStyles.Bulleted}>
			<Animated.Text style={[blockStyles.Bulleted__marker, checkedStyle]}>
				{getBulletedMarker(depth)}
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
					appearance={data.settings?.journaled ? 'success' : 'default'}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}

			<View style={blockStyles.Block__journaled} />
		</View>
	)
}
