import { useEffect } from 'react'

import { useDragSortContext } from './DragSortContext'
import type { DragSortFlatEntry, DragSortId } from './dragSort.types'

export function useSyncDragSortFlatOrder<TId extends DragSortId = DragSortId>(
	entries: DragSortFlatEntry<TId>[]
) {
	const { state } = useDragSortContext<TId>()

	useEffect(() => {
		state.flatOrder.value = entries
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [entries])
}
