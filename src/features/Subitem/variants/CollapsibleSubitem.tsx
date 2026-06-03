import { MaterialIcons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { SubitemProps } from '../index'

type CollapsibleSubitemProps = SubitemProps & {
	onExpandToggle: (expanded: boolean) => void
}

export default function CollapsibleSubitem({
	data,
	onExpandToggle,
	onCheckToggle
}: CollapsibleSubitemProps) {
	const { theme } = useUnistyles()
	const rotationProgress = useSharedValue(1) // 1 = expanded (90deg), 0 = collapsed

	const [checked, setChecked] = useState(data.state === 'done')
	const [isExpanded, setIsExpanded] = useState(false)

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

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotationProgress.value * 90}deg` }]
	}))

	const toggleExpand = () => {
		const nextExpanded = !isExpanded
		rotationProgress.value = withTiming(nextExpanded ? 1 : 0, { duration: 100 })
		setIsExpanded(nextExpanded)
		onExpandToggle(nextExpanded)
	}

	return (
		<View style={styles.container}>
			<Pressable
				onPress={toggleExpand}
				style={{ marginRight: 4, marginTop: 2 }}
			>
				<Animated.View style={animatedIconStyle}>
					<MaterialIcons
						name='play-arrow'
						size={16}
						color={theme.colors.major}
					/>
				</Animated.View>
			</Pressable>

			<Animated.Text style={[styles.text, textStyle]}>
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
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
