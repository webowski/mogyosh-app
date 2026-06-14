import { PropsWithChildren, useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedProps,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

type CircleProgressProps = PropsWithChildren & {
	progress: number
	value?: string
	size?: number
	strokeWidth?: number
	trackColor?: string
	duration?: number
	showLabel?: boolean
}

export default function CircleProgress({
	progress,
	value,
	size = 52,
	strokeWidth = 3,
	duration = 500,
	showLabel = true,
	children
}: CircleProgressProps) {
	const { theme } = useUnistyles()
	const color = theme.colors.primary

	const trackColor = theme.colors.mutedLightFill

	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius

	const animatedProgress = useSharedValue(0)

	useEffect(
		() => {
			animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
				duration,
				easing: Easing.linear
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[progress]
	)

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: circumference * (1 - animatedProgress.value)
	}))

	const center = size / 2

	return (
		<View style={styles.container(size)}>
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
					{/* <Text style={styles.label}> d</Text> */}
					<Text style={styles.label}>{value}</Text>
					{children}
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	container: (size: number) => ({
		position: 'relative',
		width: size
	}),
	labelContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 1
	},
	label: {
		fontSize: 14 * rt.fontScale,
		lineHeight: 14 * rt.fontScale,
		fontWeight: '500',
		fontVariantNumeric: 'tabular-nums',
		color: theme.colors.major
	}
}))
