import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Extrapolation,
	interpolate,
	ReduceMotion,
	SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import SVGAppLogoBig from '@/shared/images/mogyosh-logo-big.svg'
import { MaterialIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

type DrawerProps = {
	isShown: SharedValue<boolean>
	width: SharedValue<number>
	translateX: SharedValue<number>
}

export default function Drawer({ isShown, width, translateX }: DrawerProps) {
	const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
	const { theme, rt } = useUnistyles()
	const router = useRouter()
	const { t } = useTranslation()

	useAnimatedReaction(
		() => isShown.value,
		(currentState) => {
			if (currentState) {
				translateX.value = withTiming(0, {
					duration: 300,
					reduceMotion: ReduceMotion.Never
				})
			} else {
				translateX.value = withTiming(-width.value, {
					duration: 300,
					reduceMotion: ReduceMotion.Never
				})
			}
		}
	)

	useAnimatedReaction(
		() => width.value,
		() => {
			if (isShown.value) {
				isShown.value = false
			}
		}
	)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }]
	}))

	const shadowAnimatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			translateX.value,
			[-width.value, 0],
			[0, 0.2],
			Extrapolation.CLAMP
		)
	}))

	const backdropAnimatedStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			translateX.value,
			[-width.value, 0],
			[0, 0],
			Extrapolation.CLAMP
		)

		return {
			opacity: opacity,
			zIndex: translateX.value === -width.value ? 0 : 1
		}
	})

	const pan = Gesture.Pan()
		.onChange((e) => {
			if (e.translationX < 0) {
				translateX.value = withTiming(e.translationX, { duration: 0 })
			} else {
				translateX.value = withTiming(0, { duration: 0 })
			}
		})
		.onEnd((e) => {
			if (e.velocityX < -1000) {
				translateX.value = withTiming(-width.value, { duration: 140 }, () => {
					isShown.value = false
				})
			}
			if (e.translationX < -width.value * 0.33) {
				translateX.value = withTiming(-width.value, { duration: 140 }, () => {
					isShown.value = false
				})
			} else {
				translateX.value = withTiming(0)
			}
		})

	return (
		<>
			<GestureDetector gesture={pan}>
				<Animated.View
					style={[styles.container, animatedStyle]}
					onLayout={(e) => {
						width.value = e.nativeEvent.layout.width
						translateX.value = -e.nativeEvent.layout.width
					}}
				>
					<Animated.View
						style={[styles.containerShadow, shadowAnimatedStyle]}
					/>
					<View
						style={{
							flex: 1,
							justifyContent: 'space-between',
							gap: 20
						}}
					>
						<View style={styles.brandFigure}>
							<View style={styles.brandFigure__decor}></View>
							<View style={styles.brandFigure__logo}>
								<SVGAppLogoBig width={rt.screen.width * 0.5} />
							</View>
							<Text style={styles.brandFigure__subtitle}>{t('slogan')}</Text>
						</View>

						<View style={styles.menu}>
							<Pressable
								style={styles.menuItem}
								onPress={() => router.push('/about')}
							>
								<MaterialIcons
									name='info-outline'
									size={26}
									color={theme.colors.minor}
								/>
								<Text style={styles.menuItemText}>{t('About')}</Text>
							</Pressable>
							<Pressable
								style={styles.menuItem}
								onPress={() => router.push('/account')}
							>
								<MaterialIcons
									name='alternate-email'
									size={26}
									color={theme.colors.minor}
								/>
								<Text style={styles.menuItemText}>{t('Account')}</Text>
							</Pressable>
							<Pressable
								style={styles.menuItem}
								onPress={() => router.push('/settings')}
							>
								<MaterialIcons
									name='settings'
									size={26}
									color={theme.colors.minor}
								/>
								<Text style={styles.menuItemText}>{t('Settings')}</Text>
							</Pressable>

							{/* <Text style={styles.copyright}>2026 © v1.0.0</Text> */}
						</View>
					</View>
				</Animated.View>
			</GestureDetector>
			<AnimatedPressable
				style={[styles.backdrop, backdropAnimatedStyle]}
				onPress={() => {
					isShown.value = false
				}}
			/>
		</>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	brandFigure: {
		position: 'relative',
		paddingTop: 164,
		paddingLeft: '16%',
		marginBottom: 10
	},
	brandFigure__logo: {
		width: rt.screen.width * 0.5,
		zIndex: 2,
		position: 'relative'
	},
	brandFigure__subtitle: {
		marginTop: 10,
		marginLeft: '27%',
		paddingTop: 3,
		borderTopWidth: 11,
		borderColor: '#E6F4FF',
		color: theme.colors.muted,
		fontSize: 13,
		fontWeight: '400'
	},
	brandFigure__decor: {
		width: 600,
		height: 600,
		position: 'absolute',
		top: -300,
		left: -430,
		borderRadius: 600,
		backgroundColor: '#E6F4FF'
	},

	menu: {
		paddingTop: 40 + rt.insets.top,
		paddingBottom: 40 + 20 + rt.insets.bottom,
		paddingHorizontal: '16%',
		gap: 8
	},
	menuItem: {
		paddingVertical: 6,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6
	},
	menuItemText: {
		fontSize: 18,
		fontWeight: '600',
		color: theme.colors.major
	},

	copyright: {
		marginTop: 20,
		marginLeft: 32,
		fontSize: 12,
		color: theme.colors.minor
	},

	backdrop: {
		...StyleSheet.absoluteFillObject,
		flex: 1,
		backgroundColor: 'black',
		zIndex: 51
	},
	containerShadow: {
		...StyleSheet.absoluteFillObject,
		boxShadow: '0 0px 40px ' + theme.colors.shadow,
		backgroundColor: theme.colors.background
	},
	container: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		width: '80%',
		backgroundColor: theme.colors.surface,
		zIndex: 52
	}
}))
