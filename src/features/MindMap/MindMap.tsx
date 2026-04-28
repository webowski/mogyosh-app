import {
	Canvas,
	Circle,
	Group,
	Path,
	Skia,
	Text as SkiaText,
	useFont
} from '@shopify/react-native-skia'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

type Node = {
	id: string
	label: string
	children: Node[]
	x?: number
	y?: number
}

type Position = { x: number; y: number }

const NODE_RADIUS = 28
const BASE_RADIUS = 120
const LEVEL_GAP = 110

const computeRadialPositions = (root: Node) => {
	const positions = new Map<string, Position>()

	const calculate = (
		node: Node,
		depth: number,
		startAngle: number,
		angleSpan: number
	) => {
		const radius = BASE_RADIUS + depth * LEVEL_GAP
		node.x = depth === 0 ? 0 : Math.cos(startAngle) * radius
		node.y = depth === 0 ? 0 : Math.sin(startAngle) * radius

		positions.set(node.id, { x: node.x, y: node.y })

		if (node.children.length === 0) return

		const slice = angleSpan / node.children.length
		let currentAngle = startAngle - angleSpan / 2 + slice / 2

		node.children.forEach((child) => {
			calculate(child, depth + 1, currentAngle, slice * 0.92)
			currentAngle += slice
		})
	}

	calculate(root, 0, 0, Math.PI * 2)
	return positions
}

const renderConnections = (positions: Map<string, Position>, root: Node) => {
	const paths: React.ReactNode[] = []

	const draw = (node: Node) => {
		const parentPos = positions.get(node.id)
		if (!parentPos) return

		node.children.forEach((child) => {
			const childPos = positions.get(child.id)
			if (!childPos) return

			const path = Skia.Path.Make()
			path.moveTo(parentPos.x, parentPos.y)
			path.lineTo(childPos.x, childPos.y)

			paths.push(
				<Path
					key={`line-${node.id}-${child.id}`}
					path={path}
					style='stroke'
					strokeWidth={3}
					color='#666'
				/>
			)

			draw(child)
		})
	}

	draw(root)
	return paths
}

const renderNodes = (
	positions: Map<string, Position>,
	root: Node,
	font: any
) => {
	const nodes: React.ReactNode[] = []

	const draw = (node: Node) => {
		const pos = positions.get(node.id)
		if (!pos) return

		const displayText =
			node.label.length > 9 ? node.label.slice(0, 9) + '..' : node.label

		nodes.push(
			<Group key={node.id}>
				<Circle cx={pos.x} cy={pos.y} r={NODE_RADIUS} color='#1e88e5' />
				{font && (
					<SkiaText
						x={pos.x - 22}
						y={pos.y + 6}
						text={displayText}
						font={font}
						color='#fff'
					/>
				)}
			</Group>
		)

		node.children.forEach(draw)
	}

	draw(root)
	return nodes
}

// Helper function to find closest node
const findClosestNode = (
	positions: Map<string, Position>,
	canvasX: number,
	canvasY: number,
	threshold: number
): string | null => {
	let closestId: string | null = null
	let minDist = Infinity

	positions.forEach((pos, id) => {
		const dx = pos.x - canvasX
		const dy = pos.y - canvasY
		const dist = dx * dx + dy * dy
		if (dist < minDist && dist < threshold) {
			minDist = dist
			closestId = id
		}
	})

	return closestId
}

export default function MindMap() {
	const font = useFont(null, 13)
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

	const root = useMemo<Node>(
		() => ({
			id: 'root',
			label: 'Центр',
			children: [
				{
					id: '1',
					label: 'Категория 1',
					children: [
						{ id: '11', label: 'Задача 1', children: [] },
						{ id: '12', label: 'Задача 2', children: [] }
					]
				},
				{ id: '2', label: 'Категория 2', children: [] },
				{ id: '3', label: 'Категория 3', children: [] }
			]
		}),
		[]
	)

	const { positions, maxRadius } = useMemo(() => {
		const pos = computeRadialPositions(root)
		let maxR = NODE_RADIUS
		pos.forEach((p) => {
			const dist = Math.sqrt(p.x * p.x + p.y * p.y) + NODE_RADIUS
			if (dist > maxR) maxR = dist
		})
		return { positions: pos, maxRadius: maxR }
	}, [root])

	const minDimension = Math.min(canvasSize.width, canvasSize.height)
	const padding = 40
	const fitScale =
		canvasSize.width > 0 && canvasSize.height > 0
			? Math.min(1, (minDimension / 2 - padding) / maxRadius)
			: 1

	const [scaleValue, setScaleValue] = useState(1)
	const scale = useSharedValue(scaleValue)
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)

	// Обновить масштаб при изменении размеров холста
	useEffect(() => {
		if (canvasSize.width > 0 && canvasSize.height > 0) {
			scale.value = fitScale
			setScaleValue(fitScale)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasSize])

	const pan = Gesture.Pan().onChange((e) => {
		translateX.value += e.changeX / scale.value
		translateY.value += e.changeY / scale.value
	})

	const pinch = Gesture.Pinch().onChange((e) => {
		const newScale = Math.max(0.3, Math.min(3, scale.value * e.scaleChange))
		scale.value = newScale
		setScaleValue(newScale)
	})

	const longPress = Gesture.LongPress().onEnd((e) => {
		const centerX = canvasSize.width / 2
		const centerY = canvasSize.height / 2

		const canvasX = (e.x - centerX - translateX.value) / scale.value
		const canvasY = (e.y - centerY - translateY.value) / scale.value

		const closestId = findClosestNode(
			positions,
			canvasX,
			canvasY,
			NODE_RADIUS * NODE_RADIUS * 3
		)

		if (closestId) {
			Alert.alert('Узел нажат', closestId)
		} else {
			Alert.alert('Пустое место', 'Добавление узла')
		}
	})

	const gesture = Gesture.Simultaneous(pan, pinch, longPress)

	return (
		<View
			style={styles.container}
			onLayout={(e) =>
				setCanvasSize({
					width: e.nativeEvent.layout.width,
					height: e.nativeEvent.layout.height
				})
			}
		>
			<GestureDetector gesture={gesture}>
				<Canvas style={styles.canvas}>
					{canvasSize.width > 0 && canvasSize.height > 0 && (
						<Group
							transform={[
								{ translateX: canvasSize.width / 2 },
								{ translateY: canvasSize.height / 2 },
								{ translateX: translateX.value },
								{ translateY: translateY.value },
								{ scale: scaleValue }
							]}
						>
							{renderConnections(positions, root)}
							{renderNodes(positions, root, font)}
						</Group>
					)}
				</Canvas>
			</GestureDetector>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f8f8f8' },
	canvas: { flex: 1 }
})
