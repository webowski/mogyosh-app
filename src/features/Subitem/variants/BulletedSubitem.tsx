import { Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useSubitemLogic } from '../model/useSubitemLogic'

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
		<View style={styles.Bulleted}>
			<Text style={styles.Bulleted__marker}>{getBulletedMarker(depth)}</Text>
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
	Bulleted: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		paddingVertical: 4
	},
	Bulleted__marker: {
		// marginLeft: 1,
		// marginRight: 6,
		fontSize: 26,
		lineHeight: 20,
		marginTop: 0,
		marginLeft: 2
		// width: 6,
		// height: 6,
		// borderRadius: 3,
		// backgroundColor: theme.colors.major
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))

function getBulletedMarker(depth: number): string {
	const markers = ['•', '◦', '▪', '•', '◦', '▪']
	return markers[depth % markers.length]
}
