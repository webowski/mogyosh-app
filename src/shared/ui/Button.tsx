import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
	ActivityIndicator,
	Animated,
	Pressable,
	Text,
	TextStyle,
	View,
	ViewStyle
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

// ─── Types ───────────────────────────────────────────────────────────────────

type Variant = 'default' | 'secondary' | 'pill' | 'chip' | 'bare'
type Size = 'sm' | 'md' | 'lg'
type WidthMode = 'fitContent' | 'equilateral' | 'full'

interface ButtonProps {
	children: React.ReactNode
	onPress?: () => void
	variant?: Variant
	size?: Size
	widthMode?: WidthMode
	round?: boolean
	disabled?: boolean
	style?: ViewStyle
	textStyle?: TextStyle
	indicator?: boolean
	active?: boolean
	arrow?: boolean
	loading?: boolean
}

interface Ripple {
	id: number
	x: number
	y: number
	anim: Animated.Value
}

// ─── Constants ───────────────────────────────────────────────────────────────

let rippleCounter = 0
const RIPPLE_SIZE = 120

// ─── Variant configs ──────────────────────────────────────────────────────────

interface VariantConfig {
	background: ViewStyle
	useGradient?: boolean
	text: TextStyle
	rippleColor: string
	noShadow?: boolean
}

const getVariantConfigs = (
	theme: any,
	borderRadius: number,
	active?: boolean
): Map<Variant, VariantConfig> =>
	new Map([
		[
			'default',
			{
				useGradient: true,
				background: { borderRadius },
				text: { color: theme.colors.inverse },
				rippleColor: theme.colors.rippleLight
			}
		],
		[
			'secondary',
			{
				background: { borderRadius, backgroundColor: theme.colors.surface },
				text: { color: theme.colors.major },
				rippleColor: theme.colors.ripple,
				noShadow: true
			}
		],
		[
			'pill',
			{
				background: {
					borderRadius: 999,
					borderWidth: 1.5,
					borderColor: theme.colors.primaryLight,
					backgroundColor: theme.colors.primaryLighter
				},
				text: { color: theme.colors.major },
				rippleColor: theme.colors.ripple,
				noShadow: true
			}
		],
		[
			'chip',
			{
				background: {
					borderRadius: 999,
					borderWidth: 1,
					borderColor: active ? theme.colors.primary : theme.colors.border,
					backgroundColor: active ? theme.colors.primary : theme.colors.surface
				},
				text: { color: active ? theme.colors.buttonText : theme.colors.major },
				rippleColor: theme.colors.ripple,
				noShadow: true
			}
		],
		[
			'bare',
			{
				background: { borderRadius },
				text: { color: theme.colors.major },
				rippleColor: theme.colors.ripple,
				noShadow: true
			}
		]
	] as [Variant, VariantConfig][])

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
	Button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		position: 'relative',
		boxShadow: theme.colors.shadeButton
	},
	disabled: {
		opacity: 0.5
	},
	text: {
		includeFontPadding: false
	},
	noShadow: {
		boxShadow: 'none'
	},

	Button_bare: {
		padding: 0,
		boxShadow: 'none'
	}
}))

// ─── Size configs ────────────────────────────────────────────────────────────

interface SizeConfig {
	height: number
	paddingHorizontal: number
	borderRadius: number
	fontSize: number
	fontWeight: TextStyle['fontWeight']
}

const SIZE_CONFIGS: Record<Size, SizeConfig> = {
	sm: {
		height: 32,
		paddingHorizontal: 14,
		borderRadius: 4,
		fontSize: 15,
		fontWeight: '600'
	},
	md: {
		height: 42,
		paddingHorizontal: 20,
		borderRadius: 5,
		fontSize: 15,
		fontWeight: '600'
	},
	lg: {
		height: 48,
		paddingHorizontal: 32,
		borderRadius: 10,
		fontSize: 16,
		fontWeight: '600'
	}
}

const getSizeStyle = (
	sizeConfig: SizeConfig,
	widthMode: WidthMode,
	round: boolean
): ViewStyle => {
	const borderRadius = round ? 999 : sizeConfig.borderRadius

	if (widthMode === 'equilateral') {
		return {
			height: sizeConfig.height,
			width: sizeConfig.height,
			borderRadius,
			paddingHorizontal: 0
		}
	}

	if (widthMode === 'full') {
		return {
			height: sizeConfig.height,
			width: '100%',
			borderRadius,
			paddingHorizontal: sizeConfig.paddingHorizontal
		}
	}

	// fitContent
	return {
		height: sizeConfig.height,
		borderRadius,
		paddingHorizontal: sizeConfig.paddingHorizontal
	}
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
	children,
	onPress,
	variant = 'default',
	size = 'md',
	widthMode = 'fitContent',
	round = false,
	disabled = false,
	style,
	textStyle,
	indicator = false,
	active = false,
	arrow = false,
	loading = false
}) => {
	const { theme } = useUnistyles()
	const [ripples, setRipples] = React.useState<Ripple[]>([])

	// const rotation = useSharedValue(0)

	// useEffect(
	// 	() => {
	// 		if (loading) {
	// 			rotation.value = withRepeat(
	// 				withTiming(360, { duration: 800, easing: Easing.linear }),
	// 				-1,
	// 				false
	// 			)
	// 		} else {
	// 			cancelAnimation(rotation)
	// 			rotation.value = 0
	// 		}
	// 	},
	// 	// eslint-disable-next-line
	// 	[loading]
	// )

	// const spinnerAnimatedStyle = useAnimatedStyle(() => ({
	// 	transform: [{ rotate: `${rotation.value}deg` }]
	// }))

	const sizeConfig = SIZE_CONFIGS[size]
	const containerStyle = getSizeStyle(
		sizeConfig,
		widthMode,
		round || variant === 'pill' || variant === 'chip'
	)
	const borderRadius = (containerStyle.borderRadius as number) ?? 8

	const variantConfig = getVariantConfigs(theme, borderRadius, active).get(
		variant
	)!

	const handlePressIn = (event: any) => {
		const { locationX, locationY } = event.nativeEvent

		const anim = new Animated.Value(0)
		const id = ++rippleCounter

		setRipples((prev) => [...prev, { id, x: locationX, y: locationY, anim }])

		Animated.timing(anim, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true
		}).start(() => {
			setRipples((prev) => prev.filter((r) => r.id !== id))
		})
	}

	return (
		<Pressable
			onPressIn={disabled ? undefined : handlePressIn}
			onPress={disabled ? undefined : onPress}
			style={[
				styles.Button,
				containerStyle,
				disabled && styles.disabled,
				variantConfig.noShadow && styles.noShadow,
				variant === 'bare' && styles.Button_bare,
				style
			]}
		>
			{/* Layer 1: background */}
			{variantConfig.useGradient ? (
				<LinearGradient
					colors={theme.colors.gradient}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[StyleSheet.absoluteFill, { borderRadius }]}
				/>
			) : (
				<View style={[StyleSheet.absoluteFill, variantConfig.background]} />
			)}

			{/* Layer 2: ripple */}
			<View style={StyleSheet.absoluteFill} pointerEvents='none'>
				{ripples.map((ripple) => {
					const scale = ripple.anim.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 3]
					})
					const opacity = ripple.anim.interpolate({
						inputRange: [0, 0.5, 0.9],
						outputRange: [0.9, 0.5, 0]
					})

					return (
						<Animated.View
							key={ripple.id}
							style={{
								position: 'absolute',
								top: ripple.y - RIPPLE_SIZE / 2,
								left: ripple.x - RIPPLE_SIZE / 2,
								width: RIPPLE_SIZE,
								height: RIPPLE_SIZE,
								borderRadius: RIPPLE_SIZE / 2,
								backgroundColor: variantConfig.rippleColor,
								opacity,
								transform: [{ scale }]
							}}
						/>
					)
				})}
			</View>

			{/* Layer 3: content */}
			{typeof children === 'string' ? (
				<>
					{loading ? (
						// <Reanimated.View style={spinnerAnimatedStyle}>
						// 	<MaterialIcons
						// 		name='refresh'
						// 		size={(sizeStyle.text.fontSize as number) ?? 15}
						// 		color={variantConfig.text.color as string}
						// 	/>
						// </Reanimated.View>
						<ActivityIndicator
							size='small'
							color={variantConfig.text.color as string}
						/>
					) : (
						<Text
							style={[
								styles.text,
								variantConfig.text,
								{
									fontSize: sizeConfig.fontSize,
									fontWeight: sizeConfig.fontWeight
								},
								textStyle
							]}
						>
							{children}
						</Text>
					)}
					{!loading && arrow && (
						<MaterialIcons
							name='arrow-drop-down'
							size={18}
							color={theme.colors.major}
							style={{ marginLeft: 2, marginRight: -6 }}
						/>
					)}
				</>
			) : (
				<>
					{loading ? (
						// <Reanimated.View style={spinnerAnimatedStyle}>
						// 	<MaterialIcons
						// 		name='refresh'
						// 		size={20}
						// 		color={variantConfig.text.color as string}
						// 	/>
						// </Reanimated.View>
						<ActivityIndicator
							size='small'
							color={variantConfig.text.color as string}
						/>
					) : (
						children
					)}
					{!loading && arrow && (
						<MaterialIcons
							name='arrow-drop-down'
							size={18}
							style={{ marginLeft: 2, marginRight: -6 }}
						/>
					)}
				</>
			)}

			{/* Layer 3.5: indicator */}
			{indicator && (
				<View
					style={{
						position: 'absolute',
						top: 2,
						right: 2,
						width: 7,
						height: 7,
						boxShadow: theme.colors.shadeButtonIndicator,
						borderRadius: 999,
						backgroundColor: theme.colors.primaryLight
					}}
					pointerEvents='none'
				/>
			)}
		</Pressable>
	)
}
