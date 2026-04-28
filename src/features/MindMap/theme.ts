import { NodeType } from './types'

export const COLORS = {
	root: {
		bg: '#2D3250',
		text: '#FFFFFF',
		border: '#2D3250'
	},
	category: {
		bg: '#6B8CFF',
		text: '#FFFFFF',
		border: '#6B8CFF'
	},
	subcategory: {
		bg: '#F0F0F0',
		text: '#555555',
		border: '#BBBBBB'
	},
	task: {
		bg: '#FFFFFF',
		text: '#444444',
		border: '#BBBBBB'
	},
	edge: '#6B8CFF',
	canvasBg: '#F7F8FC'
}

export function getNodeColors(type: NodeType) {
	return COLORS[type]
}
