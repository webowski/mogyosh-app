export type DragSortId = string

export type DragSortFlatEntry<TId extends DragSortId = DragSortId> = {
	id: TId
	parentId: TId | null
	depth: number
}

export type DragSortDropTarget<TId extends DragSortId = DragSortId> = {
	parentId: TId | null
	prevId: TId | null
	nextId: TId | null
}

export type DragSortDropPayload<TId extends DragSortId = DragSortId> = {
	id: TId
} & DragSortDropTarget<TId>
