import { useEffect } from 'react'
import { Text, View, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	type SharedValue
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { SwipeSwitchPosition } from './model/navTypes'
import SwipeSwitchFigure from './SwipeSwitchFigure'

// ─── Imports ───────────────────────────────────────────────────────────────

const ROWS = 2
const COLS = 3

const SLIDE_WIDTH = 162
const SLIDE_HEIGHT = 52

const TOTAL_W = COLS * SLIDE_WIDTH // 486
const TOTAL_H = ROWS * SLIDE_HEIGHT // 104

const H_SWIPE_THRESHOLD = SLIDE_WIDTH * 0.25
const V_SWIPE_THRESHOLD = SLIDE_HEIGHT * 0.4
const VELOCITY_THRESHOLD = 400

// ─── Helpers (run on UI thread) ───────────────────────────────────────────────

/**
 * Wraps `value` into the range [-half, +half] of `period`.
 * Used to find the shortest circular path to render an item.
 */
function wrapToPeriod(value: number, period: number): number {
	'worklet'
	const mod = ((value % period) + period) % period
	return mod > period / 2 ? mod - period : mod
}

// ─── SlideItem ────────────────────────────────────────────────────────────────

interface SlideItemProps {
	label: string
	row: number
	col: number
	posX: SharedValue<number>
	posY: SharedValue<number>
	onPress?: (row: number, col: number) => void
	isSwitchActive: boolean
}

const SlideItem: React.FC<SlideItemProps> = ({
	label,
	row,
	col,
	posX,
	posY,
	onPress,
	isSwitchActive
}) => {
	const isSwipeSheetOpen = useNavStore((state) => state.isSwipeSheetOpen)
	const setIsSwipeSheetOpen = useNavStore((state) => state.setIsSwipeSheetOpen)
	const setSwipeSheetItem = useNavStore((state) => state.setSwipeSheetItem)

	const animatedStyle = useAnimatedStyle(() => {
		// Raw distance from this cell to current position
		const rawTransX = col * SLIDE_WIDTH - posX.value
		const rawTransY = row * SLIDE_HEIGHT - posY.value

		// Wrap to the nearest copy in the circular grid
		const transX = wrapToPeriod(rawTransX, TOTAL_W)
		const transY = wrapToPeriod(rawTransY, TOTAL_H)

		// Fade based on horizontal distance
		const opacityX = interpolate(
			transX,
			[-SLIDE_WIDTH * 0.6, 0, SLIDE_WIDTH * 0.6],
			[0, 1, 0],
			Extrapolation.CLAMP
		)

		// Fade based on vertical distance
		const opacityY = interpolate(
			transY,
			[-SLIDE_HEIGHT * 0.6, 0, SLIDE_HEIGHT * 0.6],
			[0, 1, 0],
			Extrapolation.CLAMP
		)

		return {
			transform: [{ translateX: transX }, { translateY: transY }],
			opacity: opacityX * opacityY
		}
	})

	const handlePress = (row: number, col: number) => {
		onPress?.(row, col)
		if (isSwitchActive) {
			if (isSwipeSheetOpen) {
				setIsSwipeSheetOpen(false)
			} else {
				setSwipeSheetItem({ row, col })
				setIsSwipeSheetOpen(true)
			}
		}
	}

	const gesture = Gesture.Tap().onEnd(() => {
		'worklet'
		scheduleOnRN(handlePress, row, col)
	})

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View style={[styles.slide, animatedStyle]}>
				<Text style={styles.slideLabel} numberOfLines={1}>
					{label}
				</Text>
			</Animated.View>
		</GestureDetector>
	)
}

// ─── Dot ─────────────────────────────────────────────────────────────────────

interface DotProps {
	row: number
	col: number
	posX: SharedValue<number>
	posY: SharedValue<number>
	isActive?: boolean
}

const Dot: React.FC<DotProps> = ({ row, col, posX, posY, isActive = true }) => {
	const animatedStyle = useAnimatedStyle(() => {
		// Fractional position in cell units
		const fracCol = posX.value / SLIDE_WIDTH
		const fracRow = posY.value / SLIDE_HEIGHT

		// Circular distance in cell units (wrap)
		const dCol = wrapToPeriod(fracCol - col, COLS)
		const dRow = wrapToPeriod(fracRow - row, ROWS)
		const dist = Math.sqrt(dCol * dCol + dRow * dRow)

		const opacity = interpolate(
			dist,
			[0, 1, 2],
			[1, 0.5, 0.25],
			Extrapolation.CLAMP
		)

		return { opacity }
	})

	return (
		<Animated.View
			style={[styles.dot, animatedStyle, !isActive && styles.dotInactive]}
		/>
	)
}

// ─── SwipeSwitch ──────────────────────────────────────────────────────────────

interface SwipeSwitchProps {
	style?: ViewStyle
	currentRoute?: string
	onIndexChange?: (row: number, col: number) => void
	onPress?: (row: number, col: number) => void
	isActive?: boolean
	getSlideLabel?: (row: number, col: number, defaultLabel: string) => string
}

const SwipeSwitch: React.FC<SwipeSwitchProps> = ({
	style,
	currentRoute,
	onIndexChange,
	onPress,
	isActive = true,
	getSlideLabel
}) => {
	const swipeSwitchItems = useNavStore((state) => state.swipeSwitchItems)
	const swipePosition = useNavStore((state) => state.swipePosition)
	const setSwipePosition = useNavStore((state) => state.setSwipePosition)

	// Find initial position based on current route
	const getInitialIndices = (): SwipeSwitchPosition => {
		if (!currentRoute) return { row: 0, col: 0 }
		for (let r = 0; r < swipeSwitchItems.length; r++) {
			for (let c = 0; c < swipeSwitchItems[r].length; c++) {
				const routeName = Object.keys(swipeSwitchItems[r][c])[0]
				if (routeName === currentRoute) {
					return { row: r, col: c }
				}
			}
		}
		return { row: 0, col: 0 }
	}

	const initialIndices = getInitialIndices()
	const colIndex = useSharedValue(initialIndices.col)
	const rowIndex = useSharedValue(initialIndices.row)

	const isSwitchActive = isActive

	// Pixel positions — at rest: posX = col * SLIDE_WIDTH, posY = row * SLIDE_HEIGHT.
	// These can drift beyond [0, (COLS-1)*W] intentionally to keep the spring
	// animation moving in the swipe direction across the loop boundary.
	const posX = useSharedValue(initialIndices.col * SLIDE_WIDTH)
	const posY = useSharedValue(initialIndices.row * SLIDE_HEIGHT)

	// 0 = undecided, 1 = horizontal, 2 = vertical
	const gestureAxis = useSharedValue(0)

	// // Track if initial onIndexChange has been called
	// const hasCalledInitial = useRef(false)

	// // useEffect(
	// // 	function effectOnIndexChange() {
	// // 		if (onIndexChange) {
	// // 			onIndexChange(rowIndex.value, colIndex.value)
	// // 		}
	// // 	},
	// // 	[rowIndex.value, colIndex.value]
	// // )

	// const handleIndexChange = (row: number, col: number) => {
	// 	onIndexChange?.(row, col)
	// }

	// Handle programmatic position changes from store
	useEffect(
		() => {
			if (
				swipePosition.row !== rowIndex.value ||
				swipePosition.col !== colIndex.value
			) {
				const targetRow = Math.max(0, Math.min(swipePosition.row, ROWS - 1))
				const targetCol = Math.max(0, Math.min(swipePosition.col, COLS - 1))

				rowIndex.value = targetRow
				colIndex.value = targetCol
				posX.value = withTiming(targetCol * SLIDE_WIDTH, { duration: 200 })
				posY.value = withTiming(targetRow * SLIDE_HEIGHT, { duration: 200 })

				onIndexChange?.(targetRow, targetCol)
			}
		},

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[swipePosition.row, swipePosition.col]
	)

	const pan = Gesture.Pan()
		.minDistance(6)
		.onBegin(() => {
			gestureAxis.value = 0
		})
		.onUpdate((e) => {
			// Lock axis on first meaningful movement
			if (gestureAxis.value === 0) {
				const absX = Math.abs(e.translationX)
				const absY = Math.abs(e.translationY)
				if (absX > absY && absX > 6) gestureAxis.value = 1
				else if (absY > absX && absY > 6) gestureAxis.value = 2
			}

			if (gestureAxis.value === 1) {
				posX.value = colIndex.value * SLIDE_WIDTH - e.translationX
			} else if (gestureAxis.value === 2) {
				posY.value = rowIndex.value * SLIDE_HEIGHT - e.translationY
			}
		})
		.onEnd((e) => {
			if (gestureAxis.value === 1) {
				// ── Horizontal — determine direction delta ──────────────────
				let delta = 0
				if (
					e.translationX < -H_SWIPE_THRESHOLD ||
					e.velocityX < -VELOCITY_THRESHOLD
				) {
					delta = 1 // swipe left → advance column
				} else if (
					e.translationX > H_SWIPE_THRESHOLD ||
					e.velocityX > VELOCITY_THRESHOLD
				) {
					delta = -1 // swipe right → go back
				}

				const newCol = (((colIndex.value + delta) % COLS) + COLS) % COLS

				// Target posX keeps moving in the swipe direction so the
				// spring animates through the loop edge, not back across it.
				const targetPosX =
					delta !== 0
						? colIndex.value * SLIDE_WIDTH + delta * SLIDE_WIDTH
						: colIndex.value * SLIDE_WIDTH

				colIndex.value = newCol
				posX.value = withTiming(targetPosX, { duration: 200 })
				posY.value = withTiming(rowIndex.value * SLIDE_HEIGHT, {
					duration: 200
				})

				// // // Call onIndexChange callback on JS thread
				// if (onIndexChange) {
				// 	scheduleOnRN(handleIndexChange, rowIndex.value, newCol)
				// }

				// Update store with new position
				scheduleOnRN(setSwipePosition, { row: rowIndex.value, col: newCol })
				if (onIndexChange) {
					scheduleOnRN(onIndexChange, rowIndex.value, newCol)
				}
			} else if (gestureAxis.value === 2) {
				// ── Vertical — determine direction delta ────────────────────
				let delta = 0
				if (
					e.translationY < -V_SWIPE_THRESHOLD ||
					e.velocityY < -VELOCITY_THRESHOLD
				) {
					delta = 1 // swipe up → advance row
				} else if (
					e.translationY > V_SWIPE_THRESHOLD ||
					e.velocityY > VELOCITY_THRESHOLD
				) {
					delta = -1 // swipe down → go back
				}

				const newRow = (((rowIndex.value + delta) % ROWS) + ROWS) % ROWS

				const targetPosY =
					delta !== 0
						? rowIndex.value * SLIDE_HEIGHT + delta * SLIDE_HEIGHT
						: rowIndex.value * SLIDE_HEIGHT

				rowIndex.value = newRow
				posY.value = withTiming(targetPosY, { duration: 200 })
				posX.value = withTiming(colIndex.value * SLIDE_WIDTH, { duration: 200 })

				// // // Call onIndexChange callback on JS thread
				// if (onIndexChange) {
				// 	scheduleOnRN(handleIndexChange, newRow, colIndex.value)
				// }

				// Update store with new position
				scheduleOnRN(setSwipePosition, { row: newRow, col: colIndex.value })
				if (onIndexChange) {
					scheduleOnRN(onIndexChange, newRow, colIndex.value)
				}
			} else {
				// No axis locked — snap back
				posX.value = withTiming(colIndex.value * SLIDE_WIDTH, { duration: 200 })
				posY.value = withTiming(rowIndex.value * SLIDE_HEIGHT, {
					duration: 200
				})
			}

			gestureAxis.value = 0
		})

	// // Call onIndexChange on mount to set initial route
	// useEffect(() => {
	// 	if (onIndexChange && !hasCalledInitial.current) {
	// 		hasCalledInitial.current = true
	// 		onIndexChange(rowIndex.value, colIndex.value)
	// 	}
	// 	// rowIndex and colIndex are SharedValues - their .value doesn't trigger re-renders
	// 	// We use a ref to ensure this only runs once on mount, preventing infinite loops
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [onIndexChange])

	return (
		<View style={[styles.wrapper, style]}>
			<View style={styles.bgPolygon}>
				<SwipeSwitchFigure />
			</View>

			<GestureDetector gesture={pan}>
				<View style={styles.container}>
					{swipeSwitchItems.map((row, rIdx) =>
						row.map((item, cIdx) => (
							<SlideItem
								key={`${rIdx}-${cIdx}`}
								label={
									getSlideLabel
										? getSlideLabel(rIdx, cIdx, item[Object.keys(item)[0]]!)
										: item[Object.keys(item)[0]]!
								}
								row={rIdx}
								col={cIdx}
								posX={posX}
								posY={posY}
								onPress={onPress}
								isSwitchActive={isSwitchActive}
							/>
						))
					)}
				</View>
			</GestureDetector>

			{/* 2×3 dot grid */}
			<View style={styles.dotsGrid}>
				{swipeSwitchItems.map((row, rIdx) => (
					<View key={rIdx} style={styles.dotsRow}>
						{row.map((_, cIdx) => (
							<Dot
								key={cIdx}
								row={rIdx}
								col={cIdx}
								posX={posX}
								posY={posY}
								isActive={isSwitchActive}
							/>
						))}
					</View>
				))}
			</View>
		</View>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
	wrapper: {
		alignItems: 'center',
		position: 'relative',
		gap: 8,
		transform: [{ translateY: -16 }]
	},
	bgPolygon: {
		position: 'absolute',
		top: -5,
		left: -5,
		width: 172,
		height: 62
	},
	container: {
		width: SLIDE_WIDTH,
		height: SLIDE_HEIGHT,
		overflow: 'hidden',
		borderRadius: 16
	},
	slide: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: SLIDE_WIDTH,
		height: SLIDE_HEIGHT,
		paddingBottom: 3,
		paddingLeft: 52,
		paddingRight: 10,
		justifyContent: 'center',
		alignItems: 'center'
	},
	slideLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: theme.colors.major,
		letterSpacing: -0.1
	},
	dotsGrid: {
		position: 'absolute',
		top: 11 + 5,
		left: 16 + 5,
		gap: 3,
		flexDirection: 'column',
		alignItems: 'center',
		pointerEvents: 'none'
	},
	dotsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3
	},
	dot: {
		height: 8,
		width: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.primary
	},
	dotInactive: {
		backgroundColor: theme.colors.minor
	}
}))

export default SwipeSwitch
