import { Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useSubitemLogic } from '../model/useSubitemLogic'

type OrderedSubitemProps = SubitemProps & {
	depth: number
	inputRefs?: SubitemInputRefsMap
}

export default function OrderedSubitem({
	data,
	depth,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: OrderedSubitemProps) {
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
		subitemType: 'ol'
	})

	return (
		<View style={styles.Ordered}>
			<Text style={styles.Ordered__marker}>{getOrderedMarker(depth)}</Text>
			<Animated.Text style={[styles.text, textStyle]}>
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

const styles = StyleSheet.create((theme) => ({
	Ordered: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		paddingVertical: 4
	},
	Ordered__marker: {
		// marginTop: 12,
		// marginLeft: 2,
		// width: 6,
		// height: 6,
		// borderRadius: 3,
		// backgroundColor: theme.colors.major,
		marginLeft: 2,
		marginRight: 6,
		fontSize: 16,
		lineHeight: 20,
		fontWeight: 500
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))

function getOrderedMarker(depth: number): string {
	const markers = ['1.', 'a.', '.i', '1.', 'a.', 'i.']
	return markers[depth % markers.length]
}
