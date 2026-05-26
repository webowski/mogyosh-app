import Checkbox from '@/shared/ui/Checkbox'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

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
	const animationProgress = useSharedValue(checked ? 1 : 0)

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const handlePress = () => {
		onToggle(!checked)
	}

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? 0.6 : 1, { duration: 250 })
	}))

	return (
		<View style={styles.container}>
			<Animated.Text style={[styles.text, textStyle]}>{text}</Animated.Text>
			<Checkbox checked={checked} onPress={handlePress} />
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
