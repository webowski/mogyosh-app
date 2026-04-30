import type { LayoutNode, MindMapNode } from './types'

export const NODE_HEIGHT = 36
const LEVEL_DISTANCE = 160
const VERTICAL_GAP = 16
const CATEGORY_TASK_GAP = 44
const HORIZONTAL_PADDING = 24
const MIN_NODE_WIDTH = 110
export const FONT_SIZE = 15

export function getDefaultMeasureWidth() {
	return (label: string) =>
		Math.max(
			MIN_NODE_WIDTH,
			label.length * FONT_SIZE * 0.6 + HORIZONTAL_PADDING
		)
}

function buildLayoutNode(
	node: MindMapNode,
	x: number,
	y: number,
	measureWidth: (label: string) => number,
	parentId?: string
): LayoutNode {
	return {
		id: node.id,
		label: node.label,
		type: node.type,
		x,
		y,
		width: measureWidth(node.label),
		children: [],
		parentId
	}
}

export function computeLayout(
	root: MindMapNode,
	measureWidth?: (label: string) => number
): LayoutNode {
	const measure = measureWidth ?? getDefaultMeasureWidth()
	const rootNode = buildLayoutNode(root, 0, 0, measure)

	if (!root.children || root.children.length === 0) return rootNode

	const childCount = root.children.length
	const angleStep = (Math.PI * 2) / childCount
	let currentAngle = -Math.PI

	for (const child of root.children) {
		const midAngle = currentAngle + angleStep / 2
		currentAngle += angleStep

		const childNode = placeRadialNode(
			child,
			0,
			0,
			LEVEL_DISTANCE,
			midAngle,
			root.id,
			measure
		)
		rootNode.children.push(childNode)
	}

	return rootNode
}

function placeRadialNode(
	node: MindMapNode,
	parentX: number,
	parentY: number,
	distance: number,
	angle: number,
	parentId: string,
	measureWidth: (label: string) => number
): LayoutNode {
	const x = parentX + Math.cos(angle) * distance
	const y = parentY + Math.sin(angle) * distance

	const layoutNode = buildLayoutNode(node, x, y, measureWidth, parentId)

	if (!node.children || node.children.length === 0) return layoutNode

	// Если категория выше корня (y < 0), задачи идут вверх, иначе вниз
	const isAboveRoot = y < 0

	// Если категория правее корня (x >= 0), задачи справа, иначе слева
	const isRightSide = x >= -1

	layoutNode.children = placeVerticalChildren(
		layoutNode,
		node.children,
		isAboveRoot,
		isRightSide,
		measureWidth
	)

	return layoutNode
}

function placeVerticalChildren(
	parent: LayoutNode,
	children: MindMapNode[],
	isAboveRoot: boolean,
	isRightSide: boolean,
	measureWidth: (label: string) => number
): LayoutNode[] {
	// Вертикальная линия выходит из центра категории (середина по X и Y)
	const lineX = parent.x
	// Задачи располагаются с соответствующей стороны от линии
	const childX = isRightSide
		? lineX + parent.width / 2 + 1
		: lineX - parent.width / 2 - 1

	// Если категория выше корня - задачи идут вверх, иначе вниз
	const startY = isAboveRoot
		? parent.y - NODE_HEIGHT / 2 - CATEGORY_TASK_GAP
		: parent.y + NODE_HEIGHT / 2 + CATEGORY_TASK_GAP

	return children.map((child, index) => {
		const offset = index === 0 ? 0 : (NODE_HEIGHT + VERTICAL_GAP) * index
		const childY = isAboveRoot ? startY - offset : startY + offset
		const layoutNode = buildLayoutNode(
			child,
			childX,
			childY,
			measureWidth,
			parent.id
		)

		if (child.children && child.children.length > 0) {
			layoutNode.children = placeVerticalChildren(
				layoutNode,
				child.children,
				isAboveRoot,
				isRightSide,
				measureWidth
			)
		}

		return layoutNode
	})
}

export function flattenLayout(root: LayoutNode): LayoutNode[] {
	const result: LayoutNode[] = []
	const stack = [root]
	while (stack.length > 0) {
		const node = stack.pop()!
		result.push(node)
		for (const child of node.children) {
			stack.push(child)
		}
	}
	return result
}

export function getLayoutBounds(root: LayoutNode) {
	const nodes = flattenLayout(root)
	let minX = Infinity
	let maxX = -Infinity
	let minY = Infinity
	let maxY = -Infinity

	for (const node of nodes) {
		minX = Math.min(minX, node.x - node.width / 2)
		maxX = Math.max(maxX, node.x + node.width / 2)
		minY = Math.min(minY, node.y - NODE_HEIGHT / 2)
		maxY = Math.max(maxY, node.y + NODE_HEIGHT / 2)
	}

	return {
		minX,
		maxX,
		minY,
		maxY,
		width: maxX - minX,
		height: maxY - minY
	}
}
