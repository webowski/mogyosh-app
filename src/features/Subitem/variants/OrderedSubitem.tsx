import { View } from 'react-native'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import Animated from 'react-native-reanimated'
import { getOrderedMarker } from '../model/subitem.utils'
import { useSubitemLogic } from '../model/useSubitemLogic'
import { subitemStyles } from '../style'

type OrderedSubitemProps = SubitemProps & {
	depth: number
	orderIndex: number
	inputRefs?: SubitemInputRefsMap
}

export default function OrderedSubitem({
	data,
	depth,
	orderIndex,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: OrderedSubitemProps) {
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
		subitemType: 'ol'
	})

	return (
		<View style={subitemStyles.Ordered}>
			<Animated.Text style={[subitemStyles.Ordered__marker, checkedStyle]}>
				{getOrderedMarker(depth, orderIndex)}
			</Animated.Text>
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
