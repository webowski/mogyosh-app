import { generateKeyBetween } from 'fractional-indexing'
import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemEntity } from '@/shared/domain/subitem'
import { createZustandStorage } from '@/shared/lib/mmkv'

// ---------------------------------------------------------------------------
// Virtual task ID used to fit MotivationSubitem into SubitemEntity shape
// ---------------------------------------------------------------------------

export const MOTIVATION_TASK_ID = '__motivation__' as const

// ---------------------------------------------------------------------------
// Operation types
// ---------------------------------------------------------------------------

export type MotivationOperationCreate = {
	type: 'create'
	subitem: SubitemEntity
	tempId: SubitemId
}

export type MotivationOperationUpdate = {
	type: 'update'
	id: SubitemId
	patch: Partial<
		Pick<SubitemEntity, 'info' | 'type' | 'sort_order' | 'settings'>
	>
}

export type MotivationOperationDelete = {
	type: 'delete'
	id: SubitemId
}

export type MotivationOperation =
	| MotivationOperationCreate
	| MotivationOperationUpdate
	| MotivationOperationDelete

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface MotivationStore {
	subitems: SubitemEntity[]
	pendingOperations: MotivationOperation[]

	setSubitems: (subitems: SubitemEntity[]) => void
	addSubitem: (afterId: SubitemId | null, subitem: SubitemEntity) => void
	updateSubitem: (id: SubitemId, patch: Partial<SubitemEntity>) => void
	removeSubitem: (id: SubitemId) => void
	replaceOptimisticSubitem: (
		tempId: SubitemId,
		realSubitem: SubitemEntity
	) => void

	enqueueOperation: (operation: MotivationOperation) => void
	dequeueOperations: (operations: MotivationOperation[]) => void
	clearQueue: () => void
}

// ---------------------------------------------------------------------------
// MMKV storage
// ---------------------------------------------------------------------------

const motivationMMKV = createMMKV({ id: 'motivation-subitem-storage' })
const motivationZustandStorage = createZustandStorage(motivationMMKV)

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useMotivationStore = create<MotivationStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				subitems: [],
				pendingOperations: [],

				setSubitems: (serverSubitems) =>
					set((state) => {
						const current = state.subitems

						const merged = serverSubitems.map((serverSubitem) => {
							const localSubitem = current.find(
								(s) => s.id === serverSubitem.id
							)
							return localSubitem ?? serverSubitem
						})

						const optimisticItems = current.filter(
							(s) =>
								s.id.toString().startsWith('optimistic-') &&
								!merged.some((m) => m.id === s.id)
						)

						return { subitems: [...merged, ...optimisticItems] }
					}),

				addSubitem: (afterId, subitem) =>
					set((state) => {
						const current = state.subitems
						let updatedList: SubitemEntity[]

						if (!afterId) {
							updatedList = [...current, subitem]
						} else {
							const afterIndex = current.findIndex((s) => s.id === afterId)
							if (afterIndex === -1) {
								updatedList = [...current, subitem]
							} else {
								const result = [...current]
								result.splice(afterIndex + 1, 0, subitem)
								updatedList = result
							}
						}

						return { subitems: updatedList }
					}),

				updateSubitem: (id, patch) =>
					set((state) => ({
						subitems: state.subitems.map((s) =>
							s.id === id ? { ...s, ...patch } : s
						)
					})),

				removeSubitem: (id) =>
					set((state) => ({
						subitems: state.subitems.filter((s) => s.id !== id)
					})),

				replaceOptimisticSubitem: (tempId, realSubitem) =>
					set((state) => ({
						subitems: state.subitems.map((s) =>
							s.id === tempId
								? { ...realSubitem, info: s.info, stableKey: tempId }
								: s
						)
					})),

				enqueueOperation: (operation) =>
					set((state) => {
						if (operation.type === 'update' && !operation.patch) return state
						if (
							operation.type === 'update' &&
							operation.id?.toString().startsWith('optimistic-')
						)
							return state
						return {
							pendingOperations: [...state.pendingOperations, operation]
						}
					}),

				dequeueOperations: (operations) =>
					set((state) => ({
						pendingOperations: state.pendingOperations.filter(
							(pending) => !operations.includes(pending)
						)
					})),

				clearQueue: () => set({ pendingOperations: [] })
			}),
			{
				name: 'motivation-subitem-storage',
				storage: createJSONStorage(() => motivationZustandStorage),
				// Persist only the queue, not subitems (subitems are loaded from server)
				partialize: (state) => ({ pendingOperations: state.pendingOperations })
			}
		)
	)
)

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectMotivationSubitems = (state: MotivationStore) =>
	state.subitems
export const selectMotivationPendingOperations = (state: MotivationStore) =>
	state.pendingOperations

// ---------------------------------------------------------------------------
// Helper: generate sort_order for new motivation subitem
// ---------------------------------------------------------------------------

export function generateMotivationSortOrder(
	subitems: SubitemEntity[],
	afterId: SubitemId | null
): string {
	if (subitems.length === 0) return generateKeyBetween(null, null)

	if (!afterId) {
		const last = subitems[subitems.length - 1]
		return generateKeyBetween(last?.sort_order ?? null, null)
	}

	const afterIndex = subitems.findIndex((s) => s.id === afterId)
	const afterSubitem = afterIndex >= 0 ? subitems[afterIndex] : null
	const nextSubitem = subitems[afterIndex + 1] ?? null

	return generateKeyBetween(
		afterSubitem?.sort_order ?? null,
		nextSubitem?.sort_order ?? null
	)
}
