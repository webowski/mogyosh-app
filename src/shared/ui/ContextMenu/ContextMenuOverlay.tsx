import { useEffect, useState } from 'react'
import { Pressable, Text, useWindowDimensions } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'

import { useContextMenuStore } from '@/shared/model/contextMenu.store'
import { STYLE_VARS } from '@/shared/styles/common'

const MENU_WIDTH = 220
const SCREEN_MARGIN = 8

export default function ContextMenuOverlay() {
	useUnistyles()
	const { width: windowWidth, height: windowHeight } = useWindowDimensions()

	const isOpen = useContextMenuStore((state) => state.isOpen)
	const position = useContextMenuStore((state) => state.position)
	const items = useContextMenuStore((state) => state.items)
	const closeContextMenu = useContextMenuStore(
		(state) => state.closeContextMenu
	)

	const [isMounted, setIsMounted] = useState(false)
	const [menuHeight, setMenuHeight] = useState(0)

	const progress = useSharedValue(0)

	useEffect(
		() => {
			if (isOpen) {
				setIsMounted(true)
				progress.value = withTiming(1, {
					duration: STYLE_VARS.duration.md,
					easing: Easing.out(Easing.quad)
				})
			} else if (isMounted) {
				progress.value = withTiming(
					0,
					{
						duration: STYLE_VARS.duration.md,
						easing: Easing.in(Easing.quad)
					},
					(finished) => {
						if (finished) scheduleOnRN(setIsMounted, false)
					}
				)
			}
		},
		// eslint-disable-next-line
		[isOpen]
	)

	const menuAnimatedStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [
			{ scale: 0.92 + progress.value * 0.08 },
			{ translateY: (1 - progress.value) * -6 }
		]
	}))

	if (!isMounted) return null

	const clampedLeft = Math.min(
		Math.max(position.x, SCREEN_MARGIN),
		windowWidth - MENU_WIDTH - SCREEN_MARGIN
	)
	const clampedTop = Math.min(
		Math.max(position.y, SCREEN_MARGIN),
		windowHeight - menuHeight - SCREEN_MARGIN
	)

	const handleSelectItem = (item: (typeof items)[number]) => {
		closeContextMenu()
		item.onPress()
	}

	return (
		<>
			<Pressable style={styles.Backdrop} onPress={closeContextMenu} />

			<Animated.View
				style={[
					styles.Menu,
					{ left: clampedLeft, top: clampedTop, width: MENU_WIDTH },
					menuAnimatedStyle
				]}
				onLayout={(event) => setMenuHeight(event.nativeEvent.layout.height)}
			>
				{items.map((item, itemIndex) => (
					<Pressable
						key={item.title}
						style={[
							styles.Menu__item,
							itemIndex < items.length - 1 && styles.Menu__item_bordered
						]}
						onPress={() => handleSelectItem(item)}
					>
						<Text
							style={[
								styles.Menu__itemLabel,
								item.destructive && styles.Menu__itemLabel_destructive
							]}
						>
							{item.title}
						</Text>
					</Pressable>
				))}
			</Animated.View>
		</>
	)
}

const styles = StyleSheet.create((theme) => ({
	Backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 20
	},
	Menu: {
		position: 'absolute',
		backgroundColor: theme.colors.surface,
		borderRadius: STYLE_VARS.radius_md,
		borderColor: theme.colors.borderSubtlest,
		borderWidth: 1,
		boxShadow: theme.colors.shadeActionSheet,
		zIndex: 21,
		overflow: 'hidden'
	},
	Menu__item: {
		paddingHorizontal: 16,
		paddingVertical: 12
	},
	Menu__item_bordered: {
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.borderSubtlest
	},
	Menu__itemLabel: {
		fontSize: 15,
		color: theme.colors.major
	},
	Menu__itemLabel_destructive: {
		color: theme.colors.danger
	}
}))
