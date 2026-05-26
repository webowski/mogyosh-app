import { Pressable, PressableProps, Text, ViewStyle } from 'react-native'
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type CheckboxProps = {
	checked: boolean
	style?: ViewStyle | ViewStyle[]
	onPress?: () => void
} & Omit<PressableProps, 'style' | 'onPress'>

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function Checkbox({
	checked,
	style,
	onPress,
	...props
}: CheckboxProps) {
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
		<AnimatedPressable
			onPress={onPress}
			style={[styles.checkbox, checkboxStyle, style]}
			{...props}
		>
			{checked && <Text style={styles.checkmark}>✓</Text>}
		</AnimatedPressable>
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
