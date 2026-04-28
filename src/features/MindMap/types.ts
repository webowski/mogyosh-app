export type NodeType = 'root' | 'category' | 'subcategory' | 'task'

export interface MindMapNode {
	id: string
	label: string
	type: NodeType
	children?: MindMapNode[]
}

export interface LayoutNode {
	id: string
	label: string
	type: NodeType
	x: number
	y: number
	children: LayoutNode[]
	parentId?: string
}
