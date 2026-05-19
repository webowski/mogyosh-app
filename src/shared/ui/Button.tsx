import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
	Animated,
	Pressable,
	Text,
	TextStyle,
	View,
	ViewStyle
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

// ─── Types ───────────────────────────────────────────────────────────────────

type Variant = 'default' | 'secondary' | 'pill'
type Size = 'default' | 'sm' | 'lg' | 'icon' | 'round'

interface ButtonProps {
	children: React.ReactNode
	onPress?: () => void
	variant?: Variant
	size?: Size
	disabled?: boolean
	style?: ViewStyle
	textStyle?: TextStyle
	indicator?: boolean
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

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	base: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		position: 'relative',
		boxShadow: '0px 5px 10px rgba(26, 35, 126, 0.16)'
	},
	disabled: {
		opacity: 0.5
	},
	text: {
		includeFontPadding: false
	},
	noShadow: {
		boxShadow: 'none'
	}
})

const getVariantStyles = (
	theme: any
): Record<Variant, { text: TextStyle; rippleColor: string }> => ({
	default: {
		text: { color: theme.colors.inverse },
		rippleColor: 'rgba(255,255,255,0.35)'
	},

	secondary: {
		text: { color: theme.colors.major },
		rippleColor: 'rgba(99,125,255,0.15)'
	},

	pill: {
		text: { color: theme.colors.major },
		rippleColor: 'rgba(99,125,255,0.15)'
	}
})

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
	default: {
		container: { height: 42, paddingHorizontal: 20, borderRadius: 5 },
		text: { fontSize: 15, fontWeight: '600' }
	},

	sm: {
		container: { height: 32, paddingHorizontal: 14, borderRadius: 4 },
		text: { fontSize: 15, fontWeight: '600' }
	},

	lg: {
		container: { height: 48, paddingHorizontal: 32, borderRadius: 10 },
		text: { fontSize: 16, fontWeight: '600' }
	},

	icon: {
		container: {
			height: 46,
			width: 46,
			borderRadius: 46,
			paddingHorizontal: 0
		},
		text: { fontSize: 15, fontWeight: '600' }
	},

	round: {
		container: {
			height: 48,
			width: 48,
			borderRadius: 48,
			paddingHorizontal: 0
		},
		text: { fontSize: 15, fontWeight: '600' }
	}
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
	children,
	onPress,
	variant = 'default',
	size = 'default',
	disabled = false,
	style,
	textStyle,
	indicator = false
}) => {
	const { theme } = useUnistyles()
	const [ripples, setRipples] = React.useState<Ripple[]>([])

	const variantStyle = getVariantStyles(theme)[variant]
	const sizeStyle = sizeStyles[size]
	const borderRadius =
		variant === 'pill' ? 999 : ((sizeStyle.container as any).borderRadius ?? 8)

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
				styles.base,
				sizeStyle.container,
				disabled && styles.disabled,
				variant === 'pill' && styles.noShadow,
				style
			]}
		>
			{/* Layer 1: background */}
			{variant === 'default' ? (
				<LinearGradient
					colors={[
						'hsl(225, 100%, 74%)',
						'hsl(225, 100%, 70%)',
						'hsl(225, 85%, 65%)'
					]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[StyleSheet.absoluteFill, { borderRadius }]}
				/>
			) : variant === 'secondary' ? (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							borderRadius,
							backgroundColor: theme.colors.surface
						}
					]}
				/>
			) : (
				// pill
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							borderRadius,
							borderWidth: 1.5,
							borderColor: theme.colors.primary700,
							backgroundColor: theme.colors.primary900
						}
					]}
				/>
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
								backgroundColor: variantStyle.rippleColor,
								opacity,
								transform: [{ scale }]
							}}
						/>
					)
				})}
			</View>

			{/* Layer 3: content */}
			{typeof children === 'string' ? (
				<Text
					style={[styles.text, variantStyle.text, sizeStyle.text, textStyle]}
				>
					{children}
				</Text>
			) : (
				children
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
						boxShadow: '0 0px 0px 2.5px ' + theme.colors.shadow100,
						borderRadius: 999,
						backgroundColor: theme.colors.primary600
					}}
					pointerEvents='none'
				/>
			)}
		</Pressable>
	)
}
