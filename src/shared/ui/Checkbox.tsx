import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useEffect } from 'react'
import { Pressable, PressableProps, ViewStyle } from 'react-native'
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { triggerHapticLight } from '@/shared/ui/Haptic'
import { STATIC_COLORS } from '../styles/themes'

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

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 120 })
		},
		// eslint-disable-next-line
		[checked]
	)

	const handlePress = () => {
		triggerHapticLight()
		onPress?.()
	}

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
			onPress={handlePress}
			style={[styles.checkbox, checkboxStyle, style]}
			{...props}
		>
			{checked && (
				<MaterialDesignIcons
					name='check-bold'
					size={18}
					color={STATIC_COLORS.white}
				/>
			)}
		</AnimatedPressable>
	)
}

const styles = StyleSheet.create((theme) => ({
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 4,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center'
	}
}))
