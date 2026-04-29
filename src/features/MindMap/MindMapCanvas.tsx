import {
	Canvas,
	Group,
	Line,
	RoundedRect,
	Text,
	vec
} from '@shopify/react-native-skia'
import React, { useMemo } from 'react'
import { SharedValue, useDerivedValue } from 'react-native-reanimated'

import { flattenLayout, NODE_HEIGHT, NODE_WIDTH } from './model/layout'
import { COLORS, getNodeColors } from './model/theme'
import type { LayoutNode } from './model/types'
import { useCanvasFont } from './model/useСanvasFont'

interface MindMapCanvasProps {
	root: LayoutNode
	width: number
	height: number
	translateX: SharedValue<number>
	translateY: SharedValue<number>
	scale: SharedValue<number>
}

const RADIUS = 18
const FONT_SIZE = 14

export function MindMapCanvas({
	root,
	width,
	height,
	translateX,
	translateY,
	scale
}: MindMapCanvasProps) {
	const font = useCanvasFont(FONT_SIZE)

	const nodes = useMemo(() => flattenLayout(root), [root])

	const radialEdges = useMemo(() => {
		const result: { from: LayoutNode; to: LayoutNode }[] = []
		const nodeMap = new Map<string, LayoutNode>()
		for (const n of nodes) nodeMap.set(n.id, n)
		for (const n of nodes) {
			if (n.parentId) {
				const parent = nodeMap.get(n.parentId)
				if (parent && parent.type === 'root') {
					result.push({ from: parent, to: n })
				}
			}
		}
		return result
	}, [nodes])

	const verticalLines = useMemo(() => {
		const result: { x: number; y1: number; y2: number }[] = []
		for (const n of nodes) {
			if (n.children.length > 0 && n.type !== 'root') {
				const isRightSide = n.x >= 0
				const lineX = isRightSide ? n.x + NODE_WIDTH / 2 : n.x - NODE_WIDTH / 2
				const y1 = n.y

				// Находим крайнюю точку - центр последнего потомка
				let extremeY = y1
				const stack = [...n.children]
				while (stack.length > 0) {
					const current = stack.pop()!
					if (n.y < 0) {
						// Категория выше корня - ищем минимальный Y
						extremeY = Math.min(extremeY, current.y)
					} else {
						// Категория ниже корня - ищем максимальный Y
						extremeY = Math.max(extremeY, current.y)
					}
					for (const child of current.children) {
						stack.push(child)
					}
				}
				result.push({ x: lineX, y1, y2: extremeY })
			}
		}
		return result
	}, [nodes])

	const cx = width / 2
	const cy = height / 2

	const transform = useDerivedValue(() => [
		{ translateX: cx + translateX.value },
		{ translateY: cy + translateY.value },
		{ scale: scale.value }
	])

	return (
		<Canvas style={{ width, height }}>
			<Group transform={transform}>
				{radialEdges.map(({ from, to }, i) => (
					<Line
						key={`edge-${i}`}
						p1={vec(from.x, from.y)}
						p2={vec(to.x, to.y)}
						color={COLORS.edge}
						strokeWidth={1.5}
						style='stroke'
					/>
				))}

				{verticalLines.map((line, i) => (
					<Line
						key={`vline-${i}`}
						p1={vec(line.x, line.y1)}
						p2={vec(line.x, line.y2)}
						color={COLORS.edge}
						strokeWidth={1.5}
						style='stroke'
					/>
				))}

				{nodes.map((node) => {
					const colors = getNodeColors(node.type)
					const x = node.x - NODE_WIDTH / 2
					const y = node.y - NODE_HEIGHT / 2

					return (
						<Group key={node.id}>
							<RoundedRect
								x={x - 2}
								y={y - 2}
								width={NODE_WIDTH + 4}
								height={NODE_HEIGHT + 4}
								r={RADIUS + 4}
								color={colors.border}
							/>
							<RoundedRect
								x={x}
								y={y}
								width={NODE_WIDTH}
								height={NODE_HEIGHT}
								r={RADIUS}
								color={colors.bg}
							/>
							{font && (
								<Text
									x={node.x - font.getTextWidth(node.label) / 2}
									y={node.y + FONT_SIZE / 2 - 1}
									text={node.label}
									font={font}
									color={colors.text}
								/>
							)}
						</Group>
					)
				})}
			</Group>
		</Canvas>
	)
}
