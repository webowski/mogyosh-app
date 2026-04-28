import {
	Canvas,
	Group,
	Line,
	matchFont,
	RoundedRect,
	Text,
	vec
} from '@shopify/react-native-skia'
import React, { useMemo } from 'react'
import { Platform } from 'react-native'

import { flattenLayout, NODE_HEIGHT, NODE_WIDTH } from './layout'
import { COLORS, getNodeColors } from './theme'
import { LayoutNode } from './types'

interface Props {
	root: LayoutNode
	width: number
	height: number
	translateX: number
	translateY: number
	scale: number
}

const RADIUS = 18
const FONT_SIZE = 13

export function MindMapRenderer({
	root,
	width,
	height,
	translateX,
	translateY,
	scale
}: Props) {
	const font = matchFont({
		fontFamily: Platform.select({
			ios: 'system-ui',
			android: 'sans-serif'
		}),
		fontSize: FONT_SIZE,
		fontWeight: 'normal'
	})

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

	const cx = width / 2 + translateX
	const cy = height / 2 + translateY

	return (
		<Canvas style={{ width, height }}>
			<Group transform={[{ translateX: cx }, { translateY: cy }, { scale }]}>
				{/* Edges */}
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

				{/* Nodes */}
				{nodes.map((node) => {
					const colors = getNodeColors(node.type)
					const x = node.x - NODE_WIDTH / 2
					const y = node.y - NODE_HEIGHT / 2

					return (
						<Group key={node.id}>
							{/* Border */}
							<RoundedRect
								x={x - 1}
								y={y - 1}
								width={NODE_WIDTH + 2}
								height={NODE_HEIGHT + 2}
								r={RADIUS}
								color={colors.border}
							/>
							{/* Background */}
							<RoundedRect
								x={x}
								y={y}
								width={NODE_WIDTH}
								height={NODE_HEIGHT}
								r={RADIUS}
								color={colors.bg}
							/>
							{/* Label */}
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
