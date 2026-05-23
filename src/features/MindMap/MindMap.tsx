import React, { useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView
} from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import { useUnistyles } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'
import { MindMapCanvas } from './MindMapCanvas'
import {
	computeLayout,
	getDefaultMeasureWidth,
	getLayoutBounds
} from './model/layout'
import type { LayoutNode, MindMapNode } from './model/types'

interface MindMapProps {
	data: MindMapNode
	width: number
	height: number
	onTaskPress?: (taskId: string) => void
}

const MIN_SCALE = 0.3
const MAX_SCALE = 3
const PADDING = 24
const NODE_HEIGHT = 36

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

export function MindMap({ data, width, height, onTaskPress }: MindMapProps) {
	const { theme } = useUnistyles()
	const measureWidth = useMemo(() => getDefaultMeasureWidth(), [])

	const layout = useMemo(
		() => computeLayout(data, measureWidth),
		[data, measureWidth]
	)

	const layoutRef = useRef<LayoutNode>(layout)
	useEffect(() => {
		layoutRef.current = layout
	}, [layout])

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

	const fitRef = useRef(fit)
	useEffect(() => {
		fitRef.current = fit
	}, [fit])

	useEffect(
		() => {
			translateX.value = fitRef.current.translateX
			translateY.value = fitRef.current.translateY
			savedTx.value = fitRef.current.translateX
			savedTy.value = fitRef.current.translateY
			scale.value = fitRef.current.scale
			savedScale.value = fitRef.current.scale
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)

	const flattenNodes = (node: LayoutNode): LayoutNode[] => {
		const result: LayoutNode[] = [node]
		node.children.forEach((child) => {
			result.push(...flattenNodes(child))
		})
		return result
	}

	const handleTap = (e: any) => {
		if (!onTaskPress) return

		const cx = width / 2
		const cy = height / 2

		const screenX = e.x
		const screenY = e.y

		const localX = (screenX - cx - translateX.value) / scale.value
		const localY = (screenY - cy - translateY.value) / scale.value

		const allNodes = flattenNodes(layoutRef.current)

		for (const node of allNodes) {
			if (node.type === 'task') {
				const nodeLeft = node.x - node.width / 2
				const nodeRight = node.x + node.width / 2
				const nodeTop = node.y - NODE_HEIGHT / 2
				const nodeBottom = node.y + NODE_HEIGHT / 2

				if (
					localX >= nodeLeft &&
					localX <= nodeRight &&
					localY >= nodeTop &&
					localY <= nodeBottom
				) {
					onTaskPress(node.id)
					return
				}
			}
		}
	}

	const tapGesture = Gesture.Tap()
		.numberOfTaps(1)
		.onEnd((event) => {
			scheduleOnRN(handleTap, event)
		})

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

	const composedGesture = Gesture.Simultaneous(
		panGesture,
		pinchGesture,
		tapGesture
	)

	return (
		<GestureHandlerRootView style={styles.root}>
			<GestureDetector gesture={composedGesture}>
				<View
					style={[
						styles.canvas,
						{ width, height, backgroundColor: theme.colors.backgroundAlter }
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
