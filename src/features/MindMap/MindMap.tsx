import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView
} from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import { MindMapCanvas } from './MindMapCanvas'
import { computeLayout, getLayoutBounds } from './model/layout'
import { COLORS } from './model/theme'
import type { LayoutNode, MindMapNode } from './model/types'

interface MindMapProps {
	data: MindMapNode
	width: number
	height: number
}

const MIN_SCALE = 0.3
const MAX_SCALE = 3
const PADDING = 24

function computeFitTransform(
	layout: LayoutNode,
	width: number,
	height: number
) {
	const bounds = getLayoutBounds(layout)
	const boundsWidth = bounds.width + PADDING * 2
	const boundsHeight = bounds.height + PADDING * 2

	const nextScale = Math.min(
		MAX_SCALE,
		Math.max(MIN_SCALE, Math.min(width / boundsWidth, height / boundsHeight))
	)

	const centerX = (bounds.minX + bounds.maxX) / 2
	const centerY = (bounds.minY + bounds.maxY) / 2

	return {
		scale: nextScale,
		translateX: -centerX * nextScale,
		translateY: -centerY * nextScale
	}
}

export function MindMap({ data, width, height }: MindMapProps) {
	const layout = useMemo(() => computeLayout(data), [data])

	const fit = useMemo(
		() => computeFitTransform(layout, width, height),
		[layout, width, height]
	)

	const translateX = useSharedValue(fit.translateX)
	const translateY = useSharedValue(fit.translateY)
	const savedTx = useSharedValue(fit.translateX)
	const savedTy = useSharedValue(fit.translateY)
	const scale = useSharedValue(fit.scale)
	const savedScale = useSharedValue(fit.scale)

	useEffect(() => {
		translateX.value = fit.translateX
		translateY.value = fit.translateY
		savedTx.value = fit.translateX
		savedTy.value = fit.translateY
		scale.value = fit.scale
		savedScale.value = fit.scale
	}, [fit, translateX, translateY, savedTx, savedTy, scale, savedScale])

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
					<MindMapCanvas
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
