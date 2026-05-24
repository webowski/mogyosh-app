import { Text } from 'react-native'
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type CheckboxProps = {
	checked: boolean
}

export default function Checkbox({ checked }: CheckboxProps) {
	const { theme } = useUnistyles()

	const animationProgress = useSharedValue(checked ? 1 : 0)

	const checkboxStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			animationProgress.value,
			[0, 1],
			['transparent', theme.colors.primary]
		),
		borderColor: interpolateColor(
			animationProgress.value,
			[0, 1],
			[theme.colors.border, theme.colors.primary]
		)
	}))

	return (
		<Animated.View style={[styles.checkbox, checkboxStyle]}>
			{checked && <Text style={styles.checkmark}>✓</Text>}
		</Animated.View>
	)
}

const styles = StyleSheet.create((theme) => ({
	checkbox: {
		width: 22,
		height: 22,
		borderRadius: 4,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center'
	},
	checkmark: {
		color: theme.colors.inverse,
		fontSize: 14,
		lineHeight: 16,
		fontWeight: 700
	}
}))
