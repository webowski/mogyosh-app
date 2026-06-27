import { generateKeyBetween } from 'fractional-indexing'
import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

import { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { createZustandStorage } from '@/shared/lib/mmkv'

// ---------------------------------------------------------------------------
// Operation types
// ---------------------------------------------------------------------------

export type SubitemOperationCreate = {
	type: 'create'
	subitem: SubitemEntity
	tempId: SubitemId
}

export type SubitemOperationUpdate = {
	type: 'update'
	id: SubitemId
	taskId: TaskId
	patch: Partial<
		Pick<SubitemEntity, 'info' | 'type' | 'sort_order' | 'settings'>
	>
}

export type SubitemOperationDelete = {
	type: 'delete'
	id: SubitemId
	taskId: TaskId
}

export type SubitemOperation =
	| SubitemOperationCreate
	| SubitemOperationUpdate
	| SubitemOperationDelete

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface SubitemStore {
	// Subitems by taskId
	subitemsByTask: Record<TaskId, SubitemEntity[]>

	// Pending operations queue (persisted to MMKV)
	pendingOperations: SubitemOperation[]

	// Actions: subitems
	setSubitems: (taskId: TaskId, subitems: SubitemEntity[]) => void
	addSubitem: (afterId: SubitemId | null, subitem: SubitemEntity) => void
	updateSubitem: (
		id: SubitemId,
		taskId: TaskId,
		patch: Partial<SubitemEntity>
	) => void
	removeSubitem: (id: SubitemId, taskId: TaskId) => void
	replaceOptimisticSubitem: (
		tempId: SubitemId,
		taskId: TaskId,
		realSubitem: SubitemEntity
	) => void

	// Actions: queue
	enqueueOperation: (operation: SubitemOperation) => void
	dequeueOperations: (operations: SubitemOperation[]) => void
	clearQueue: () => void
}

// ---------------------------------------------------------------------------
// MMKV storage
// ---------------------------------------------------------------------------

const subitemMMKV = createMMKV({ id: 'subitem-storage' })
const subitemZustandStorage = createZustandStorage(subitemMMKV)

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSubitemStore = create<SubitemStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				subitemsByTask: {},
				pendingOperations: [],

				setSubitems: (taskId, subitems) =>
					set((state) => ({
						subitemsByTask: {
							...state.subitemsByTask,
							[taskId]: subitems
						}
					})),

				addSubitem: (afterId, subitem) =>
					set((state) => {
						const taskId = subitem.task_id
						const current = state.subitemsByTask[taskId] ?? []

						let updatedList: SubitemEntity[]

						if (!afterId) {
							// Insert at end
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

						return {
							subitemsByTask: {
								...state.subitemsByTask,
								[taskId]: updatedList
							}
						}
					}),

				updateSubitem: (id, taskId, patch) =>
					set((state) => {
						const current = state.subitemsByTask[taskId] ?? []
						return {
							subitemsByTask: {
								...state.subitemsByTask,
								[taskId]: current.map((s) =>
									s.id === id ? { ...s, ...patch } : s
								)
							}
						}
					}),

				removeSubitem: (id, taskId) =>
					set((state) => {
						const current = state.subitemsByTask[taskId] ?? []
						return {
							subitemsByTask: {
								...state.subitemsByTask,
								[taskId]: current.filter((s) => s.id !== id)
							}
						}
					}),

				replaceOptimisticSubitem: (tempId, taskId, realSubitem) =>
					set((state) => {
						const current = state.subitemsByTask[taskId] ?? []
						return {
							subitemsByTask: {
								...state.subitemsByTask,
								[taskId]: current.map((s) =>
									s.id === tempId ? realSubitem : s
								)
							}
						}
					}),

				enqueueOperation: (operation) =>
					set((state) => ({
						pendingOperations: [...state.pendingOperations, operation]
					})),

				dequeueOperations: (operations) =>
					set((state) => ({
						pendingOperations: state.pendingOperations.filter(
							(pending) => !operations.includes(pending)
						)
					})),

				clearQueue: () => set({ pendingOperations: [] })
			}),
			{
				name: 'subitem-storage',
				storage: createJSONStorage(() => subitemZustandStorage),
				// Persist only the queue, not subitems (subitems are loaded from server)
				partialize: (state) => ({ pendingOperations: state.pendingOperations })
			}
		)
	)
)

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectSubitems =
	(taskId: TaskId | null) => (state: SubitemStore) =>
		taskId ? (state.subitemsByTask[taskId] ?? []) : []

export const selectPendingOperations = (state: SubitemStore) =>
	state.pendingOperations

// ---------------------------------------------------------------------------
// Helper: generate sort_order for new subitem
// ---------------------------------------------------------------------------

export function generateSubitemSortOrder(
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
