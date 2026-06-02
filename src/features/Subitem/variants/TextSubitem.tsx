import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import Checkbox from '@/shared/ui/Checkbox'
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

	const handlePress = useCallback(
		() => {
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? 0.38 : 1, { duration: 120 })
	}))

	return (
		<View style={styles.container}>
			<Animated.Text style={[styles.text, textStyle]}>
				{data.info}
			</Animated.Text>
			{onCheckToggle && <Checkbox checked={checked} onPress={handlePress} />}
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
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
