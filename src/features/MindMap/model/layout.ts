import type { LayoutNode, MindMapNode } from './types'

export const NODE_HEIGHT = 36
const MIN_LEVEL_DISTANCE = 140
const VERTICAL_GAP = 16
const CATEGORY_TASK_GAP = 44
const HORIZONTAL_PADDING = 24
const MIN_NODE_WIDTH = 110
const MIN_COLUMN_GAP = 28
const COLLISION_ITERATIONS = 12
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

/** Total vertical space occupied by a node and its vertically stacked children */
function getSubtreeHeight(node: MindMapNode): number {
	if (!node.children || node.children.length === 0) {
		return NODE_HEIGHT
	}

	let childrenHeight = 0
	for (let index = 0; index < node.children.length; index++) {
		childrenHeight += getSubtreeHeight(node.children[index])
		if (index < node.children.length - 1) {
			childrenHeight += VERTICAL_GAP
		}
	}

	return NODE_HEIGHT + CATEGORY_TASK_GAP + childrenHeight
}

/** Max label width in the subtree (for horizontal gap estimation) */
function getSubtreeMaxWidth(
	node: MindMapNode,
	measureWidth: (label: string) => number
): number {
	let maxWidth = measureWidth(node.label)
	if (node.children) {
		for (const child of node.children) {
			maxWidth = Math.max(maxWidth, getSubtreeMaxWidth(child, measureWidth))
		}
	}
	return maxWidth
}

export function computeLayout(
	root: MindMapNode,
	measureWidth?: (label: string) => number
): LayoutNode {
	const measure = measureWidth ?? getDefaultMeasureWidth()
	const rootNode = buildLayoutNode(root, 0, 0, measure)

	if (!root.children || root.children.length === 0) return rootNode

	const childCount = root.children.length

	const subtreeHeights = root.children.map((child) => getSubtreeHeight(child))
	const subtreeMaxWidths = root.children.map((child) =>
		getSubtreeMaxWidth(child, measure)
	)

	// Weight sectors by subtree height so larger branches get more angular space
	const weights = subtreeHeights.map((height) => Math.max(height, NODE_HEIGHT))
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

	const sectorAngles = weights.map(
		(weight) => (weight / totalWeight) * Math.PI * 2
	)

	// Dynamic radius: ensure adjacent columns have enough horizontal separation
	let levelDistance = MIN_LEVEL_DISTANCE
	for (let index = 0; index < childCount; index++) {
		const nextIndex = (index + 1) % childCount
		const angleBetweenMids =
			sectorAngles[index] / 2 + sectorAngles[nextIndex] / 2
		const neededGap =
			subtreeMaxWidths[index] / 2 +
			subtreeMaxWidths[nextIndex] / 2 +
			MIN_COLUMN_GAP

		const sinHalf = Math.sin(angleBetweenMids / 2)
		if (sinHalf > 0.05) {
			const neededRadius = neededGap / (2 * sinHalf)
			levelDistance = Math.max(levelDistance, neededRadius)
		}
	}

	// Extra room when there are many large vertical stacks
	const maxSubtreeHeight = Math.max(...subtreeHeights)
	levelDistance = Math.max(
		levelDistance,
		MIN_LEVEL_DISTANCE + maxSubtreeHeight * 0.15
	)

	let currentAngle = -Math.PI
	for (let index = 0; index < childCount; index++) {
		const midAngle = currentAngle + sectorAngles[index] / 2
		currentAngle += sectorAngles[index]

		const childNode = placeRadialNode(
			root.children[index],
			0,
			0,
			levelDistance,
			midAngle,
			root.id,
			measure
		)
		rootNode.children.push(childNode)
	}

	resolveBranchCollisions(rootNode)

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

	// Если категория выше корня - задачи идут вверх, иначе вниз
	const startY = isAboveRoot
		? parent.y - NODE_HEIGHT / 2 - CATEGORY_TASK_GAP
		: parent.y + NODE_HEIGHT / 2 + CATEGORY_TASK_GAP

	return children.map((child, index) => {
		const offset = index === 0 ? 0 : (NODE_HEIGHT + VERTICAL_GAP) * index
		const childY = isAboveRoot ? startY - offset : startY + offset

		// Сначала измеряем ширину потомка
		const childW = measureWidth(child.label)

		// Позиционируем центр потомка так, чтобы узел примыкал к вертикальной линии
		// childX - childW / 2 = lineX + 1 (для правой стороны)
		// childX + childW / 2 = lineX - 1 (для левой стороны)
		const childX = isRightSide ? lineX + childW / 2 + 1 : lineX - childW / 2 - 1

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

interface BranchBounds {
	minX: number
	maxX: number
	minY: number
	maxY: number
}

function getBranchBounds(node: LayoutNode): BranchBounds {
	const nodes = flattenLayout(node)
	let minX = Infinity
	let maxX = -Infinity
	let minY = Infinity
	let maxY = -Infinity

	for (const item of nodes) {
		minX = Math.min(minX, item.x - item.width / 2)
		maxX = Math.max(maxX, item.x + item.width / 2)
		minY = Math.min(minY, item.y - NODE_HEIGHT / 2)
		maxY = Math.max(maxY, item.y + NODE_HEIGHT / 2)
	}

	return { minX, maxX, minY, maxY }
}

function boundsOverlap(a: BranchBounds, b: BranchBounds, gap: number): boolean {
	return (
		a.minX < b.maxX + gap &&
		a.maxX + gap > b.minX &&
		a.minY < b.maxY + gap &&
		a.maxY + gap > b.minY
	)
}

function translateBranch(node: LayoutNode, deltaX: number, deltaY: number) {
	node.x += deltaX
	node.y += deltaY
	for (const child of node.children) {
		translateBranch(child, deltaX, deltaY)
	}
}

/**
 * Push overlapping top-level branches radially outward until their
 * bounding boxes no longer collide (with MIN_COLUMN_GAP padding).
 */
function resolveBranchCollisions(root: LayoutNode) {
	const branches = root.children
	if (branches.length < 2) return

	for (let iteration = 0; iteration < COLLISION_ITERATIONS; iteration++) {
		let hasCollision = false

		for (let index = 0; index < branches.length; index++) {
			for (
				let otherIndex = index + 1;
				otherIndex < branches.length;
				otherIndex++
			) {
				const branchA = branches[index]
				const branchB = branches[otherIndex]
				const boundsA = getBranchBounds(branchA)
				const boundsB = getBranchBounds(branchB)

				if (!boundsOverlap(boundsA, boundsB, MIN_COLUMN_GAP)) continue

				hasCollision = true

				// Push both branches away from the origin along their current direction
				const lengthA = Math.hypot(branchA.x, branchA.y) || 1
				const lengthB = Math.hypot(branchB.x, branchB.y) || 1

				const pushAmount = 20
				const dirAX = branchA.x / lengthA
				const dirAY = branchA.y / lengthA
				const dirBX = branchB.x / lengthB
				const dirBY = branchB.y / lengthB

				translateBranch(branchA, dirAX * pushAmount, dirAY * pushAmount)
				translateBranch(branchB, dirBX * pushAmount, dirBY * pushAmount)
			}
		}

		if (!hasCollision) break
	}
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
