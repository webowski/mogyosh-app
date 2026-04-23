import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

import { TaskEntity } from '@/shared/domain/task'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type ChecklistItemProps = {
	data: TaskEntity
	onToggle?: (id: string, completed: boolean) => void
}

export const ChecklistItem = ({ data, onToggle }: ChecklistItemProps) => {
	const { theme } = useUnistyles()
	const [completed, setCompleted] = useState(false)
	const progress = useSharedValue(0)

	const handlePress = () => {
		const next = !completed
		setCompleted(next)
		progress.value = withTiming(next ? 1 : 0, { duration: 250 })
		onToggle?.(data.id, next)
	}

	const checkboxStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.value,
			[0, 1],
			['transparent', theme.colors.primary]
		),
		borderColor: interpolateColor(
			progress.value,
			[0, 1],
			['#D1D5DB', theme.colors.primary]
		)
	}))

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(completed ? 0.6 : 1, { duration: 250 })
	}))

	return (
		<Pressable onPress={handlePress} style={styles.container}>
			<Animated.View style={[styles.checkbox, checkboxStyle]}>
				{completed && <Text style={styles.checkmark}>✓</Text>}
			</Animated.View>
			<Animated.Text style={[styles.text, textStyle]}>
				{data.info}
			</Animated.Text>
		</Pressable>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
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
