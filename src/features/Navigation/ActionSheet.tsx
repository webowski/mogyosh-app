import { useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { STYLE_VARS } from '@/shared/styles/common'

// const SHEET_HEIGHT = Dimensions.get('window').height * 0.4
const SHEET_HEIGHT = 220

export default function ActionSheet() {
	const insets = useSafeAreaInsets()
	const [isMounted, setIsMounted] = useState(false)
	// const { theme } = useUnistyles()

	const isActionSheetOpen = useNavStore((state) => state.isActionSheetOpen)
	const setIsActionSheetOpen = useNavStore(
		(state) => state.setIsActionSheetOpen
	)
	const actionSheetItem = useNavStore((state) => state.actionSheetItem)
	const setActionSheetItem = useNavStore((state) => state.setActionSheetItem)

	const swipeSwitchItems = useNavStore((state) => state.swipeSwitchItems)
	const navigation = useNavigation()

	const translateY = useSharedValue(SHEET_HEIGHT)
	// const isVisible = useSharedValue(false)

	// Закрываем шит при переключении роута
	useEffect(
		() => {
			const unsubscribe = navigation.addListener('state', () => {
				setIsActionSheetOpen(false)
				setActionSheetItem(null)
			})

			return unsubscribe
		},
		// eslint-disable-next-line
		[navigation, setActionSheetItem]
	)

	useEffect(
		() => {
			if (isActionSheetOpen) {
				setIsMounted(true)
				translateY.value = withTiming(0, {
					duration: 200,
					easing: Easing.inOut(Easing.quad)
				})
			} else if (isMounted) {
				translateY.value = withTiming(
					SHEET_HEIGHT,
					{
						duration: 200,
						easing: Easing.inOut(Easing.quad)
					},
					(finished) => {
						if (finished) scheduleOnRN(setIsMounted, false)
					}
				)
			}
		},
		// eslint-disable-next-line
		[isActionSheetOpen]
	)

	const dismiss = () => setIsActionSheetOpen(false)

	const dragGesture = Gesture.Pan()
		.onUpdate((e) => {
			if (e.translationY > 0) {
				translateY.value = e.translationY
			}
		})
		.onEnd((e) => {
			if (e.translationY > SHEET_HEIGHT * 0.3 || e.velocityY > 800) {
				scheduleOnRN(dismiss)
			} else {
				translateY.value = withTiming(0, { duration: 200 })
			}
		})

	const sheetStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }]
	}))

	const item = actionSheetItem
		? swipeSwitchItems[actionSheetItem.row]?.[actionSheetItem.col]
		: null
	const label = item ? item[Object.keys(item)[0]]! : ''

	// if (actionSheetItem === null && translateY.value === SHEET_HEIGHT) return null
	if (!isMounted) return null

	return (
		<>
			{/* Backdrop */}
			<Pressable style={styles.backdrop} onPress={dismiss} />

			{/* Sheet */}
			<GestureDetector gesture={dragGesture}>
				<Animated.View
					style={[
						styles.sheet,
						{
							bottom: insets.bottom > 0 ? 70 + insets.bottom - 6 : 70 + 24 - 6
						},
						sheetStyle
					]}
				>
					<View style={styles.grabber} />
					<View style={styles.content}>
						<Text>{label}</Text>
					</View>
				</Animated.View>
			</GestureDetector>
		</>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 9
	},
	sheet: {
		position: 'absolute',
		left: STYLE_VARS.sidePadding,
		right: STYLE_VARS.sidePadding,
		height: SHEET_HEIGHT,
		backgroundColor: theme.colors.surface,
		borderTopLeftRadius: STYLE_VARS.radius_xl,
		borderTopRightRadius: STYLE_VARS.radius_xl,
		borderCurve: 'continuous',
		zIndex: 10,
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 12,
		boxShadow: theme.colors.shadeActionSheet,
		borderColor: theme.colors.borderLightest,
		borderWidth: 1
	},
	grabber: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: theme.colors.mutedTextDark,
		alignSelf: 'center',
		marginBottom: 12
	},
	content: {
		flex: 1
	}
}))
