import type { LayoutNode, MindMapNode } from './types'

export const NODE_HEIGHT = 36
const LEVEL_DISTANCE = 120
const VERTICAL_GAP = 16
const CATEGORY_TASK_GAP = 44
const HORIZONTAL_PADDING = 24
const MIN_NODE_WIDTH = 110
const MIN_COLUMN_GAP = 24
const COLLISION_ITERATIONS = 20
const MAX_PUSH_PER_STEP = 16
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

export function computeLayout(
	root: MindMapNode,
	measureWidth?: (label: string) => number
): LayoutNode {
	const measure = measureWidth ?? getDefaultMeasureWidth()
	const rootNode = buildLayoutNode(root, 0, 0, measure)

	if (!root.children || root.children.length === 0) return rootNode

	const childCount = root.children.length

	// Weight sectors by subtree height so larger branches get more angular space
	const weights = root.children.map((child) =>
		Math.max(getSubtreeHeight(child), NODE_HEIGHT)
	)
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
	const sectorAngles = weights.map(
		(weight) => (weight / totalWeight) * Math.PI * 2
	)

	let currentAngle = -Math.PI
	for (let index = 0; index < childCount; index++) {
		const midAngle = currentAngle + sectorAngles[index] / 2
		currentAngle += sectorAngles[index]

		const childNode = placeRadialNode(
			root.children[index],
			0,
			0,
			LEVEL_DISTANCE,
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
 * Push only overlapping top-level branches apart by the actual penetration depth.
 * Branches that do not collide stay at LEVEL_DISTANCE.
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

				const overlapX =
					Math.min(boundsA.maxX, boundsB.maxX) -
					Math.max(boundsA.minX, boundsB.minX) +
					MIN_COLUMN_GAP
				const overlapY =
					Math.min(boundsA.maxY, boundsB.maxY) -
					Math.max(boundsA.minY, boundsB.minY) +
					MIN_COLUMN_GAP

				if (overlapX <= 0 || overlapY <= 0) continue

				hasCollision = true

				// Separate along the axis of least penetration
				const centerAX = (boundsA.minX + boundsA.maxX) / 2
				const centerAY = (boundsA.minY + boundsA.maxY) / 2
				const centerBX = (boundsB.minX + boundsB.maxX) / 2
				const centerBY = (boundsB.minY + boundsB.maxY) / 2

				let deltaX = 0
				let deltaY = 0

				if (overlapX < overlapY) {
					const direction = centerAX <= centerBX ? -1 : 1
					const push = Math.min(overlapX / 2, MAX_PUSH_PER_STEP)
					deltaX = direction * push
				} else {
					const direction = centerAY <= centerBY ? -1 : 1
					const push = Math.min(overlapY / 2, MAX_PUSH_PER_STEP)
					deltaY = direction * push
				}

				translateBranch(branchA, deltaX, deltaY)
				translateBranch(branchB, -deltaX, -deltaY)
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
