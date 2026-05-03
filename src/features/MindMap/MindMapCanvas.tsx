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

import { flattenLayout, FONT_SIZE, NODE_HEIGHT } from './model/layout'
import { COLORS, getNodeColors } from './model/theme'
import type { LayoutNode, LayoutNodeWithText } from './model/types'
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

export function MindMapCanvas({
	root,
	width,
	height,
	translateX,
	translateY,
	scale
}: MindMapCanvasProps) {
	const font = useCanvasFont()
	const nodes = useMemo(() => flattenLayout(root), [root])

	const { radialEdges, verticalLines } = useMemo(() => {
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

		const vLines: { x: number; y1: number; y2: number }[] = []
		for (const n of nodes) {
			if (n.children.length > 0 && n.type !== 'root') {
				const lineX = n.x
				const y1 = n.y

				// Находим крайнюю точку среди непосредственных детей
				let extremeY = n.y < 0 ? Infinity : -Infinity
				for (const child of n.children) {
					if (n.y < 0) {
						extremeY = Math.min(extremeY, child.y)
					} else {
						extremeY = Math.max(extremeY, child.y)
					}
				}
				vLines.push({ x: lineX, y1, y2: extremeY })
			}
		}

		return { radialEdges: result, verticalLines: vLines }
	}, [nodes])

	const nodesWithText = useMemo((): LayoutNodeWithText[] => {
		return nodes.map((node) => {
			const tw = font ? font.getTextWidth(node.label) : 0
			return {
				...node,
				textWidth: tw,
				textX: node.x - tw / 2,
				textY: node.y + FONT_SIZE / 2 - 1
			}
		})
	}, [nodes, font])

	const cx = useMemo(() => width / 2, [width])
	const cy = useMemo(() => height / 2, [height])

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
						strokeWidth={2}
						style='stroke'
					/>
				))}

				{verticalLines.map((line, i) => (
					<Line
						key={`vline-${i}`}
						p1={vec(line.x, line.y1)}
						p2={vec(line.x, line.y2)}
						color={COLORS.lineMinor}
						strokeWidth={2}
						style='stroke'
					/>
				))}

				{nodesWithText.map((node) => {
					const colors = getNodeColors(node.type)
					const w = node.width
					const h = NODE_HEIGHT
					const x = node.x - w / 2
					const y = node.y - h / 2

					return (
						<Group key={node.id}>
							<RoundedRect
								x={x - 2}
								y={y - 2}
								width={w + 4}
								height={h + 4}
								r={RADIUS + 4}
								color={colors.border}
							/>
							<RoundedRect
								x={x}
								y={y}
								width={w}
								height={h}
								r={RADIUS}
								color={colors.bg}
							/>
							{font && (
								<Text
									x={node.textX}
									y={node.textY}
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
