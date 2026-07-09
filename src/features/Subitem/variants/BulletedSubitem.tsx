import { Text, View } from 'react-native'
import Animated from 'react-native-reanimated'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
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
		textStyle,
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
			<Text style={subitemStyles.Bulleted__marker}>
				{getBulletedMarker(depth)}
			</Text>
			<Animated.Text style={[subitemStyles.text, textStyle]}>
				<MarkdownInput
					ref={inputRef}
					subitemText={data.info}
					onChangeMarkdown={handleChangeText}
					onEnterPress={handleAddAfter}
					onFocus={handleFocus}
					onBackspaceOnEmpty={() => {
						onRemove?.()
					}}
				/>
			</Animated.Text>
			{data.settings?.checkable && (
				<Checkbox checked={checked} onPress={handlePressCheckbox} />
			)}
		</View>
	)
}
