import {
	Canvas,
	Circle,
	Group,
	Path,
	Skia,
	Text as SkiaText,
	useFont
} from '@shopify/react-native-skia'
import React, { useMemo } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useDerivedValue, useSharedValue } from 'react-native-reanimated'

type Node = {
	id: string
	label: string
	children: Node[]
	x?: number
	y?: number
}

const NODE_RADIUS = 28
const BASE_RADIUS = 120
const LEVEL_GAP = 110

const computeRadialPositions = (root: Node) => {
	const positions = new Map<string, { x: number; y: number }>()

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

const renderConnections = (
	positions: Map<string, { x: number; y: number }>,
	root: Node
) => {
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
	positions: Map<string, { x: number; y: number }>,
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

export default function MindMap() {
	const font = useFont(null, 13)

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

	const scale = useSharedValue(1)
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)

	const positions = useDerivedValue(() => computeRadialPositions(root))

	const pan = Gesture.Pan().onChange((e) => {
		translateX.value += e.changeX / scale.value
		translateY.value += e.changeY / scale.value
	})

	const pinch = Gesture.Pinch().onChange((e) => {
		scale.value = Math.max(0.3, Math.min(3, scale.value * e.scaleChange))
	})

	const longPress = Gesture.LongPress().onEnd((e) => {
		const canvasX = (e.x - translateX.value) / scale.value
		const canvasY = (e.y - translateY.value) / scale.value

		let closestId: string | null = null
		let minDist = Infinity

		positions.value.forEach((pos, id) => {
			const dx = pos.x - canvasX
			const dy = pos.y - canvasY
			const dist = dx * dx + dy * dy
			if (dist < minDist && dist < NODE_RADIUS * NODE_RADIUS * 3) {
				minDist = dist
				closestId = id
			}
		})

		if (closestId) {
			Alert.alert('Узел нажат', closestId)
		} else {
			root.children.push({
				id: Date.now().toString(),
				label: 'Новая',
				children: []
			})
		}
	})

	const gesture = Gesture.Simultaneous(pan, pinch, longPress)

	return (
		<View style={styles.container}>
			<GestureDetector gesture={gesture}>
				<Canvas style={styles.canvas}>
					<Group
						transform={[
							{ translateX: translateX.value },
							{ translateY: translateY.value },
							{ scale: scale.value }
						]}
					>
						{renderConnections(positions.value, root)}
						{renderNodes(positions.value, root, font)}
					</Group>
				</Canvas>
			</GestureDetector>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f8f8f8' },
	canvas: { flex: 1 }
})
