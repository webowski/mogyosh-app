import type { NodeType } from './types'

export function getNodeColors(type: NodeType) {
	return {
		root: { bg: '#2D3250', text: '#FFFFFF', border: '#2D3250' },
		category: { bg: '#6B8CFF', text: '#FFFFFF', border: '#6B8CFF' },
		subcategory: { bg: '#97A2C4', text: '#fff', border: '#97A2C4' },
		task: { bg: '#FFFFFF', text: '#444444', border: '#97A2C4' }
	}[type]
}

export const LINE_MINOR_COLOR = '#97A2C4'
export const EDGE_COLOR = '#6B8CFF'
// deprecated: MindMap canvas background should use theme.colors.surfaceAlter
export const CANVAS_BG = '#F7F8FC'
