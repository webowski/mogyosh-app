import { View } from 'react-native'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import Animated from 'react-native-reanimated'
import { getBulletedMarker } from '../model/subitem.utils'
import { useSubitemLogic } from '../model/useSubitemLogic'
import { subitemStyles } from '../style'

type BulletedSubitemProps = SubitemProps & {
	depth: number
	inputRefs?: SubitemInputRefsMap
}

export default function BulletedSubitem({
	data,
	depth,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: BulletedSubitemProps) {
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
		subitemType: 'ul'
	})

	return (
		<View style={subitemStyles.Bulleted}>
			<Animated.Text style={[subitemStyles.Bulleted__marker, checkedStyle]}>
				{getBulletedMarker(depth)}
			</Animated.Text>
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
