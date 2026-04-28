import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView
} from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import { computeLayout } from './layout'
import { MindMapRenderer } from './MindMapRenderer'
import { COLORS } from './theme'
import { MindMapNode } from './types'

interface Props {
	data: MindMapNode
	width: number
	height: number
}

const MIN_SCALE = 0.3
const MAX_SCALE = 3

export function MindMap({ data, width, height }: Props) {
	const layout = useMemo(() => computeLayout(data), [data])

	// Pan state
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)
	const savedTx = useSharedValue(0)
	const savedTy = useSharedValue(0)

	// Zoom state
	const scale = useSharedValue(1)
	const savedScale = useSharedValue(1)

	const panGesture = Gesture.Pan()
		.onStart(() => {
			savedTx.value = translateX.value
			savedTy.value = translateY.value
		})
		.onUpdate((e) => {
			translateX.value = savedTx.value + e.translationX
			translateY.value = savedTy.value + e.translationY
		})

	const pinchGesture = Gesture.Pinch()
		.onStart(() => {
			savedScale.value = scale.value
		})
		.onUpdate((e) => {
			const next = savedScale.value * e.scale
			scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
		})

	const composed = Gesture.Simultaneous(panGesture, pinchGesture)

	// We need JS-side values for Skia (not animated style)
	// Use a state bridge via reanimated derived values
	const [tx, setTx] = React.useState(0)
	const [ty, setTy] = React.useState(0)
	const [sc, setSc] = React.useState(1)

	// Sync reanimated shared values to React state for Skia
	// We use a worklet-compatible approach: onEnd callbacks
	const panSync = Gesture.Pan()
		.onStart(() => {
			savedTx.value = translateX.value
			savedTy.value = translateY.value
		})
		.onUpdate((e) => {
			translateX.value = savedTx.value + e.translationX
			translateY.value = savedTy.value + e.translationY
		})
		.onChange((e) => {
			setTx(savedTx.value + e.translationX)
			setTy(savedTy.value + e.translationY)
		})

	const pinchSync = Gesture.Pinch()
		.onStart(() => {
			savedScale.value = scale.value
		})
		.onUpdate((e) => {
			const next = savedScale.value * e.scale
			const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
			scale.value = clamped
			setSc(clamped)
		})

	const composedGesture = Gesture.Simultaneous(panSync, pinchSync)

	return (
		<GestureHandlerRootView style={styles.root}>
			<GestureDetector gesture={composedGesture}>
				<View
					style={[
						styles.canvas,
						{ width, height, backgroundColor: COLORS.canvasBg }
					]}
				>
					<MindMapRenderer
						root={layout}
						width={width}
						height={height}
						translateX={tx}
						translateY={ty}
						scale={sc}
					/>
				</View>
			</GestureDetector>
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	canvas: { overflow: 'hidden' }
})
