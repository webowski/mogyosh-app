import React, { useEffect } from 'react'
import { Pressable, ViewStyle } from 'react-native'
import Animated, {
	interpolateColor,
	ReduceMotion,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type ToggleValue = string | number

interface ToggleButtonConfig {
	value: ToggleValue
	label: string
	style?: ViewStyle
}

interface ToggleGroupProps {
	value: ToggleValue
	onChange: (value: ToggleValue) => void
	buttons: ToggleButtonConfig[]
}

const DURATION = 180

function ToggleItem({
	button,
	selected,
	onPress,
	radiusStyle
}: {
	button: ToggleButtonConfig
	selected: boolean
	onPress?: () => void
	radiusStyle: ViewStyle
}) {
	const { theme } = useUnistyles()
	const progress = useSharedValue(selected ? 1 : 0)

	useEffect(
		() => {
			progress.value = withTiming(selected ? 1 : 0, {
				duration: DURATION,
				reduceMotion: ReduceMotion.Never
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selected]
	)

	const animatedContainerStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.value,
			[0, 1],
			[theme.colors.surface, theme.colors.primary]
		),
		borderColor: interpolateColor(
			progress.value,
			[0, 1],
			[theme.colors.borderLight, theme.colors.primary]
		)
	}))

	const animatedTextStyle = useAnimatedStyle(() => ({
		color: interpolateColor(
			progress.value,
			[0, 1],
			[theme.colors.major, theme.colors.inverse]
		)
	}))

	return (
		<Pressable onPress={onPress} style={[styles.itemWrapper, radiusStyle]}>
			<Animated.View
				style={[styles.item, radiusStyle, animatedContainerStyle, button.style]}
			>
				<Animated.Text style={[styles.label, animatedTextStyle]}>
					{button.label}
				</Animated.Text>
			</Animated.View>
		</Pressable>
	)
}

export function ToggleGroup({ value, onChange, buttons }: ToggleGroupProps) {
	return (
		<Animated.View style={styles.container}>
			{buttons.map((button, index) => {
				let radiusStyle = styles.radiusNone
				if (index === 0) radiusStyle = styles.radiusFirst
				if (index === buttons.length - 1) radiusStyle = styles.radiusLast

				return (
					<ToggleItem
						key={button.value}
						button={button}
						selected={button.value === value}
						radiusStyle={radiusStyle}
						onPress={
							button.value === value ? undefined : () => onChange(button.value)
						}
					/>
				)
			})}
		</Animated.View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 0
	},
	itemWrapper: {
		overflow: 'hidden'
	},
	item: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderWidth: 1
	},
	label: {
		fontSize: theme.fontSize.sm,
		fontWeight: '500'
	},
	radiusFirst: {
		borderTopLeftRadius: 8,
		borderBottomLeftRadius: 8
	},
	radiusLast: {
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8
	},
	radiusNone: {}
}))
