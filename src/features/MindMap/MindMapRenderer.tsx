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
import { LayoutNode } from './model/types'
import { useCanvasFont } from './model/useСanvasFont'

interface Props {
	root: LayoutNode
	width: number
	height: number
	translateX: SharedValue<number>
	translateY: SharedValue<number>
	scale: SharedValue<number>
}

const RADIUS = 18
const FONT_SIZE = 14

export function MindMapRenderer({
	root,
	width,
	height,
	translateX,
	translateY,
	scale
}: Props) {
	const font = useCanvasFont(FONT_SIZE)

	const nodes = useMemo(() => flattenLayout(root), [root])

	const edges = useMemo(() => {
		const result: { from: LayoutNode; to: LayoutNode }[] = []
		const nodeMap = new Map<string, LayoutNode>()
		for (const n of nodes) nodeMap.set(n.id, n)
		for (const n of nodes) {
			if (n.parentId) {
				const parent = nodeMap.get(n.parentId)
				if (parent) result.push({ from: parent, to: n })
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
				{edges.map(({ from, to }, i) => (
					<Line
						key={`edge-${i}`}
						p1={vec(from.x, from.y)}
						p2={vec(to.x, to.y)}
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
