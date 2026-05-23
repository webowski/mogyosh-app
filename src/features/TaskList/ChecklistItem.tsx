import { useEffect } from 'react'
import { Pressable, Text } from 'react-native'
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type ChecklistItemProps = {
	checked: boolean
	text: string
	onToggle: (value: boolean) => void
}

export const ChecklistItem = ({
	checked,
	text,
	onToggle
}: ChecklistItemProps) => {
	const { theme } = useUnistyles()
	const animationProgress = useSharedValue(checked ? 1 : 0)

	// Синхронизируем анимацию с prop checked
	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const handlePress = () => {
		const newValue = !checked
		onToggle(newValue)
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
			['#D1D5DB', theme.colors.primary]
		)
	}))

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? 0.6 : 1, { duration: 250 })
	}))

	return (
		<Pressable onPress={handlePress} style={styles.container}>
			<Animated.Text style={[styles.text, textStyle]}>{text}</Animated.Text>
			<Animated.View style={[styles.checkbox, checkboxStyle]}>
				{checked && <Text style={styles.checkmark}>✓</Text>}
			</Animated.View>
		</Pressable>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 6
	},
	checkbox: {
		width: 22,
		height: 22,
		borderRadius: 4,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center'
	},
	checkmark: {
		color: theme.colors.bright,
		fontSize: 14,
		lineHeight: 16,
		fontWeight: 700
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
