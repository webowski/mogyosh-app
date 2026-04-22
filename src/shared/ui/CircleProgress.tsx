// import { Text, View } from 'react-native'

// type CircleProgressProps = {
// 	title: string
// }

// export default function CircleProgress({ title }: CircleProgressProps) {
// 	return (
// 		<View>
// 			<Text>{title}</Text>
// 		</View>
// 	)
// }

import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedProps,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { useUnistyles } from 'react-native-unistyles'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircleProgressBarProps {
	progress: number // 0 to 1
	size?: number
	strokeWidth?: number
	trackColor?: string
	duration?: number
	showLabel?: boolean
}

export default function CircleProgressBar({
	progress,
	size = 64,
	strokeWidth = 5,
	duration = 600,
	showLabel = true
}: CircleProgressBarProps) {
	const { theme } = useUnistyles()
	const color = theme.colors.primary

	const trackColor = theme.colors.backgroundAlter

	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius

	const animatedProgress = useSharedValue(0)

	useEffect(() => {
		animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
			duration,
			easing: Easing.out(Easing.cubic)
		})
	}, [progress])

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: circumference * (1 - animatedProgress.value)
	}))

	const center = size / 2

	return (
		<View style={styles.container}>
			<Svg width={size} height={size}>
				{/* Track */}
				<Circle
					cx={center}
					cy={center}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					fill='none'
				/>
				{/* Progress */}
				<AnimatedCircle
					cx={center}
					cy={center}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill='none'
					strokeDasharray={circumference}
					animatedProps={animatedProps}
					strokeLinecap='round'
					transform={`rotate(-90, ${center}, ${center})`}
				/>
			</Svg>
			{showLabel && (
				<View style={[StyleSheet.absoluteFill, styles.labelContainer]}>
					<Text style={styles.label}>{Math.round(progress * 100)}%</Text>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'relative'
	},
	labelContainer: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	label: {
		fontSize: 18,
		fontWeight: '600',
		color: '#111827'
	}
})
