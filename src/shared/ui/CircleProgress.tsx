import {
	forwardRef,
	PropsWithChildren,
	useEffect,
	useImperativeHandle,
	useRef
} from 'react'
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
	decreasing?: boolean
	animated?: boolean
}

export type CircleProgressRef = {
	snapTo: (value: number) => void
}

const CircleProgress = forwardRef<CircleProgressRef, CircleProgressProps>(
	(
		{
			progress,
			value,
			size = 52,
			strokeWidth = 3,
			duration = 500,
			showLabel = true,
			children,
			decreasing = false
		},
		ref
	) => {
		const { theme } = useUnistyles()

		const color = theme.colors.primary
		const trackColor = theme.colors.mutedSubtlestFill

		const radius = (size - strokeWidth) / 2
		const circumference = 2 * Math.PI * radius

		const clampProgress = (value: number) => Math.min(Math.max(value, 0), 1)

		const animatedProgress = useSharedValue(clampProgress(progress))
		const previousProgressRef = useRef(clampProgress(progress))

		useImperativeHandle(ref, () => ({
			snapTo: (val: number) => {
				const clamped = clampProgress(val)
				previousProgressRef.current = clamped
				animatedProgress.value = clamped
			}
		}))

		useEffect(
			() => {
				const clamped = clampProgress(progress)
				if (clamped === previousProgressRef.current) return
				previousProgressRef.current = clamped
				animatedProgress.value = withTiming(clamped, {
					duration,
					easing: Easing.linear
				})
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[progress]
		)

		const animatedProps = useAnimatedProps(() => ({
			strokeDashoffset: decreasing
				? circumference * animatedProgress.value
				: circumference * (1 - animatedProgress.value)
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
						transform={
							decreasing
								? `scale(-1, 1) translate(-${size}, 0) rotate(-90, ${center}, ${center})`
								: `rotate(-90, ${center}, ${center})`
						}
					/>
				</Svg>
				{showLabel && (
					<View style={[StyleSheet.absoluteFill, styles.labelContainer]}>
						{value && <Text style={styles.label}>{value}</Text>}
						{children}
					</View>
				)}
			</View>
		)
	}
)

CircleProgress.displayName = 'CircleProgress'

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

export default CircleProgress
