import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView
} from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import { MindMapRenderer } from './MindMapRenderer'
import { computeLayout } from './model/layout'
import { COLORS } from './model/theme'
import { MindMapNode } from './model/types'

interface Props {
	data: MindMapNode
	width: number
	height: number
}

const MIN_SCALE = 0.3
const MAX_SCALE = 3

export function MindMap({ data, width, height }: Props) {
	const layout = useMemo(() => computeLayout(data), [data])

	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)
	const savedTx = useSharedValue(0)
	const savedTy = useSharedValue(0)
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

	const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture)

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
						translateX={translateX}
						translateY={translateY}
						scale={scale}
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
