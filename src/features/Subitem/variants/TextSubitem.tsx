import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { SubitemProps } from '../index'

export default function TextSubitem({ data, onCheckToggle }: SubitemProps) {
	const [checked, setChecked] = useState(data.state === 'done')

	const animationProgress = useSharedValue(checked ? 1 : 0)

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const handlePressCheckbox = useCallback(
		() => {
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? STYLE_VARS.checkedOpacity : 1, {
			duration: STYLE_VARS.duration.md
		})
	}))

	return (
		<View style={styles.container}>
			<Animated.Text style={[styles.text, textStyle]}>
				<MarkdownInput
					// ref={getRefForSubitemInput(subitem.id)}
					subitemText={data.info}
					// onChangeText={(info) => updateSubitem(data.id, info)}
					// onChangeMarkdown={(markdown) => updateSubitem(data.id, markdown)}
					// onEnterPress={() => addSubitemAfter(index)}
					// onBackspaceOnEmpty={() => removeSubitem(index)}
				/>
				{data.info}
			</Animated.Text>
			{data.settings?.checkable && (
				<Checkbox checked={checked} onPress={handlePressCheckbox} />
			)}
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 6
	},
	text: {
		flex: 1,
		fontSize: 15,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
