import type { LayoutNode, MindMapNode } from './types'

const NODE_WIDTH = 110
const NODE_HEIGHT = 36
const LEVEL_DISTANCE = 160
const MIN_ANGULAR_GAP = 0.18 // radians

function countLeaves(node: MindMapNode): number {
	if (!node.children || node.children.length === 0) return 1
	return node.children.reduce((sum, c) => sum + countLeaves(c), 0)
}

function buildLayoutNode(
	node: MindMapNode,
	x: number,
	y: number,
	parentId?: string
): LayoutNode {
	return {
		id: node.id,
		label: node.label,
		type: node.type,
		x,
		y,
		children: [],
		parentId
	}
}

export function computeLayout(root: MindMapNode): LayoutNode {
	const rootNode = buildLayoutNode(root, 0, 0)

	if (!root.children || root.children.length === 0) return rootNode

	const totalLeaves = root.children.reduce((sum, c) => sum + countLeaves(c), 0)

	let currentAngle = -Math.PI
	const twoPi = Math.PI * 2

	for (const child of root.children) {
		const leaves = countLeaves(child)
		const angleSpan = Math.max(
			(leaves / totalLeaves) * twoPi,
			MIN_ANGULAR_GAP * 2
		)
		const midAngle = currentAngle + angleSpan / 2
		currentAngle += angleSpan

		const childNode = placeSubtree(
			child,
			0,
			0,
			LEVEL_DISTANCE,
			midAngle,
			angleSpan,
			root.id
		)
		rootNode.children.push(childNode)
	}

	return rootNode
}

function placeSubtree(
	node: MindMapNode,
	parentX: number,
	parentY: number,
	distance: number,
	angle: number,
	angleSpan: number,
	parentId: string
): LayoutNode {
	const x = parentX + Math.cos(angle) * distance
	const y = parentY + Math.sin(angle) * distance

	const layoutNode = buildLayoutNode(node, x, y, parentId)

	if (!node.children || node.children.length === 0) return layoutNode

	const totalLeaves = node.children.reduce((sum, c) => sum + countLeaves(c), 0)

	const halfSpan = Math.min(angleSpan / 2, (Math.PI * 2) / 3)
	const startAngle = angle - halfSpan

	let currentAngle = startAngle

	for (const child of node.children) {
		const leaves = countLeaves(child)
		const childSpan = Math.max(
			(leaves / totalLeaves) * halfSpan * 2,
			MIN_ANGULAR_GAP
		)
		const midAngle = currentAngle + childSpan / 2
		currentAngle += childSpan

		const childNode = placeSubtree(
			child,
			x,
			y,
			LEVEL_DISTANCE * 0.85,
			midAngle,
			childSpan,
			node.id
		)
		layoutNode.children.push(childNode)
	}

	return layoutNode
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
		minX = Math.min(minX, node.x - NODE_WIDTH / 2)
		maxX = Math.max(maxX, node.x + NODE_WIDTH / 2)
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

export { NODE_HEIGHT, NODE_WIDTH }
