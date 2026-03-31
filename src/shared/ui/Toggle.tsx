import React, { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type Props = {
	value?: boolean
	onChange?: (value: boolean) => void
	disabled?: boolean
}

export function Toggle({ value, onChange, disabled = false }: Props) {
	const { theme } = useUnistyles()

	// Неконтролируемый режим: если value не передан, используем внутренний state
	const isControlled = typeof value === 'boolean'
	const [internalValue, setInternalValue] = React.useState(false)
	const currentValue = isControlled ? value! : internalValue

	// Два независимых значения: одно для нативного драйвера (thumb), второе для цвета
	const thumbAnim = useRef(new Animated.Value(currentValue ? 1 : 0)).current
	const colorAnim = useRef(new Animated.Value(currentValue ? 1 : 0)).current

	useEffect(() => {
		Animated.timing(thumbAnim, {
			toValue: currentValue ? 1 : 0,
			duration: 120,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true
		}).start()

		Animated.timing(colorAnim, {
			toValue: currentValue ? 1 : 0,
			duration: 120,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: false
		}).start()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentValue])

	const handlePress = () => {
		if (disabled) return
		if (isControlled) {
			onChange && onChange(!currentValue)
		} else {
			setInternalValue((prev) => {
				onChange && onChange(!prev)
				return !prev
			})
		}
	}

	const thumbTranslate = thumbAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [3, 25]
	})

	const trackColor = colorAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [theme.colors.muted600, theme.colors.primary]
	})

	return (
		<Pressable
			onPress={handlePress}
			accessibilityRole='switch'
			accessibilityState={{ checked: currentValue, disabled }}
			hitSlop={8}
			style={{ opacity: disabled ? 0.4 : 1 }}
		>
			<Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
				<Animated.View
					style={[
						styles.thumb,
						{
							transform: [{ translateX: thumbTranslate }]
						}
					]}
				/>
			</Animated.View>
		</Pressable>
	)
}

const styles = StyleSheet.create((themes) => ({
	track: {
		width: 52,
		height: 30,
		borderRadius: 15,
		justifyContent: 'center'
	},
	thumb: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: themes.colors.inverse,
		shadowColor: '#000',
		shadowOpacity: 0.18,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3
	}
}))
