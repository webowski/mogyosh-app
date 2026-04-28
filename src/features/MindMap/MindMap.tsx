// src/features/MindMap/MindMap.tsx
import {
	Canvas,
	Group,
	Path,
	RoundedRect,
	Skia,
	Text as SkiaText,
	useFont
} from '@shopify/react-native-skia'
import React, { useEffect, useMemo } from 'react'
import { Alert, Dimensions, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useDerivedValue, useSharedValue } from 'react-native-reanimated'

type Node = {
	id: string
	label: string
	level: number // 0 = центр, 1 = Category, 2 = Subcategory, 3 = Task
	children: Node[]
	x?: number
	y?: number
}

const computeRadialPositions = (root: Node) => {
	const positions = new Map<string, { x: number; y: number }>()

	const calculate = (
		node: Node,
		depth: number,
		startAngle: number,
		angleSpan: number
	) => {
		const radius = 130 + depth * 135
		node.x = depth === 0 ? 0 : Math.cos(startAngle) * radius
		node.y = depth === 0 ? 0 : Math.sin(startAngle) * radius

		positions.set(node.id, { x: node.x, y: node.y })

		if (node.children.length === 0) return

		const slice = angleSpan / node.children.length
		let currentAngle = startAngle - angleSpan / 2 + slice / 2

		node.children.forEach((child) => {
			calculate(child, depth + 1, currentAngle, slice * 0.95)
			currentAngle += slice
		})
	}

	calculate(root, 0, 0, Math.PI * 2)
	return positions
}

const getNodeStyle = (level: number) => {
	if (level === 0)
		return {
			color: '#1F1F1F',
			textColor: '#FFFFFF',
			width: 140,
			height: 52,
			radius: 26
		}
	if (level === 1)
		return {
			color: '#3B82F6',
			textColor: '#FFFFFF',
			width: 118,
			height: 46,
			radius: 23
		}
	if (level === 2)
		return {
			color: '#4B5563',
			textColor: '#FFFFFF',
			width: 110,
			height: 42,
			radius: 21
		}
	return {
		color: '#F1F5F9',
		textColor: '#1F2937',
		width: 100,
		height: 38,
		radius: 19
	} // level 3 (Task)
}

const renderConnections = (
	positions: Map<string, { x: number; y: number }>,
	root: Node
) => {
	const paths: React.ReactNode[] = []

	const draw = (node: Node) => {
		const p1 = positions.get(node.id)
		if (!p1) return

		node.children.forEach((child) => {
			const p2 = positions.get(child.id)
			if (!p2) return

			const path = Skia.Path.Make()
			path.moveTo(p1.x, p1.y)
			path.lineTo(p2.x, p2.y)

			paths.push(
				<Path
					key={`line-${node.id}-${child.id}`}
					path={path}
					style='stroke'
					strokeWidth={3.5}
					color='#64748B'
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

		const style = getNodeStyle(node.level)
		const halfW = style.width / 2
		const halfH = style.height / 2

		const displayText =
			node.label.length > 14 ? node.label.slice(0, 14) + '..' : node.label

		nodes.push(
			<Group key={node.id}>
				<RoundedRect
					x={pos.x - halfW}
					y={pos.y - halfH}
					width={style.width}
					height={style.height}
					r={style.radius}
					color={style.color}
				/>
				{font && (
					<SkiaText
						x={pos.x - 45}
						y={pos.y + 6}
						text={displayText}
						font={font}
						color={style.textColor}
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

	const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

	const root = useMemo<Node>(
		() => ({
			id: 'root',
			label: 'Categories',
			level: 0,
			children: [
				{
					id: 'c1',
					label: 'Category',
					level: 1,
					children: [
						{ id: 's1', label: 'Subcategory', level: 2, children: [] },
						{ id: 's2', label: 'Subcategory', level: 2, children: [] }
					]
				},
				{ id: 'c2', label: 'Category', level: 1, children: [] },
				{
					id: 'c3',
					label: 'Category',
					level: 1,
					children: [
						{ id: 't1', label: 'Task', level: 3, children: [] },
						{ id: 't2', label: 'Task', level: 3, children: [] }
					]
				}
			]
		}),
		[]
	)

	const scale = useSharedValue(1)
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)

	// Center the mind map on initial render
	useEffect(
		() => {
			translateX.value = screenWidth / 2
			translateY.value = screenHeight / 2
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[screenWidth, screenHeight]
	)

	const positions = useDerivedValue(() => computeRadialPositions(root))

	const pan = Gesture.Pan().onChange((e) => {
		translateX.value += e.changeX / scale.value
		translateY.value += e.changeY / scale.value
	})

	const pinch = Gesture.Pinch().onChange((e) => {
		scale.value = Math.max(0.4, Math.min(3, scale.value * e.scaleChange))
	})

	const longPress = Gesture.LongPress().onEnd((e) => {
		Alert.alert('Узел нажат', 'Здесь будет добавление нового узла')
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
	container: { flex: 1, backgroundColor: '#0F172A' },
	canvas: { flex: 1 }
})
