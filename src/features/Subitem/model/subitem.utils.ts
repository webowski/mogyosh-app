import { SubitemId } from '@/shared/domain/ids'
import type { SubitemData, SubitemEntity } from '@/shared/domain/subitem'
import type { DragSortFlatEntry } from '@/shared/modules/DragSort'

export function flattenSubitemTree(
	tree: SubitemData[],
	depth = 0,
	parentId: SubitemId | null = null
): DragSortFlatEntry<SubitemId>[] {
	return tree.flatMap((item) => [
		{ id: item.id, parentId, depth },
		...flattenSubitemTree(item.children, depth + 1, item.id)
	])
}

// Helper: build tree from flat list
export function buildSubitemTree(
	subitems: SubitemEntity[],
	parentId: SubitemId | null = null
): SubitemData[] {
	return subitems
		.filter((item) => (item.parent_id ?? null) === parentId)
		.map((item) => ({
			...item,
			children: buildSubitemTree(subitems, item.id)
		}))
}

export function getOrderedSiblingIndex(
	siblings: SubitemData[],
	subitemId: SubitemId
): number {
	let count = 0
	for (const sibling of siblings) {
		if (sibling.type === 'ol') {
			count += 1
			if (sibling.id === subitemId) return count
		}
	}
	return count
}

export function getBulletedMarker(depth: number): string {
	const markers = ['•', '◦', '▪', '•', '◦', '▪']
	return markers[depth % markers.length]
}

export function getOrderedMarker(depth: number, orderIndex: number): string {
	const level = depth % 3
	if (level === 0) return `${orderIndex}.`
	if (level === 1) return `${toAlphaMarker(orderIndex)}.`
	return `${toRomanMarker(orderIndex)}.`
}

function toAlphaMarker(orderIndex: number): string {
	let result = ''
	let remainingIndex = orderIndex
	while (remainingIndex > 0) {
		const remainder = (remainingIndex - 1) % 26
		result = String.fromCharCode(97 + remainder) + result
		remainingIndex = Math.floor((remainingIndex - 1) / 26)
	}
	return result
}

function toRomanMarker(orderIndex: number): string {
	const romanNumerals: [number, string][] = [
		[1000, 'm'],
		[900, 'cm'],
		[500, 'd'],
		[400, 'cd'],
		[100, 'c'],
		[90, 'xc'],
		[50, 'l'],
		[40, 'xl'],
		[10, 'x'],
		[9, 'ix'],
		[5, 'v'],
		[4, 'iv'],
		[1, 'i']
	]
	let result = ''
	let remainingValue = orderIndex
	for (const [value, symbol] of romanNumerals) {
		while (remainingValue >= value) {
			result += symbol
			remainingValue -= value
		}
	}
	return result
}
