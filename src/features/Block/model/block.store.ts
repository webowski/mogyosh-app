import { generateKeyBetween } from 'fractional-indexing'
import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

import { BlockEntity } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { createZustandStorage } from '@/shared/lib/mmkv'

// ---------------------------------------------------------------------------
// Operation types
// ---------------------------------------------------------------------------

export type BlockOperationCreate = {
	type: 'create'
	block: BlockEntity
	tempId: BlockId
}

export type BlockOperationUpdate = {
	type: 'update'
	id: BlockId
	taskId: TaskId
	patch: Partial<
		Pick<
			BlockEntity,
			'text_content' | 'type' | 'sort_order' | 'settings' | 'parent_id'
		>
	>
}

export type BlockOperationDelete = {
	type: 'delete'
	id: BlockId
	taskId: TaskId
}

export type BlockOperation =
	| BlockOperationCreate
	| BlockOperationUpdate
	| BlockOperationDelete

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export type BlockMoveDirection = 'up' | 'down'

export interface BlockStore {
	// Blocks by taskId
	blocksByTask: Record<TaskId, BlockEntity[]>

	// Pending operations queue (persisted to MMKV)
	pendingOperations: BlockOperation[]

	// Actions: blocks
	setBlocks: (taskId: TaskId, blocks: BlockEntity[]) => void
	addBlock: (afterId: BlockId | null, block: BlockEntity) => void
	updateBlock: (
		id: BlockId,
		taskId: TaskId,
		patch: Partial<BlockEntity>
	) => void
	removeBlock: (id: BlockId, taskId: TaskId) => void

	moveBlock: (
		id: BlockId,
		taskId: TaskId,
		direction: BlockMoveDirection
	) => void

	reorderBlock: (
		id: BlockId,
		taskId: TaskId,
		newParentId: BlockId | null,
		prevId: BlockId | null,
		nextId: BlockId | null
	) => void

	replaceOptimisticBlock: (
		tempId: BlockId,
		taskId: TaskId,
		realBlock: BlockEntity
	) => void

	// Actions: queue
	enqueueOperation: (operation: BlockOperation) => void
	dequeueOperations: (operations: BlockOperation[]) => void
	clearQueue: () => void
}

// ---------------------------------------------------------------------------
// MMKV storage
// ---------------------------------------------------------------------------

const blockMMKV = createMMKV({ id: 'block-storage' })
const blockZustandStorage = createZustandStorage(blockMMKV)

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBlockStore = create<BlockStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				blocksByTask: {},
				pendingOperations: [],

				setBlocks: (taskId, blocks) =>
					set((state) => {
						const current = state.blocksByTask[taskId] ?? []

						// Merge: keep local changes for existing items, add new from server
						const merged = blocks.map((serverBlock) => {
							const localBlock = current.find((s) => s.id === serverBlock.id)
							// Keep local version if it exists (user may have typed)
							return localBlock ?? serverBlock
						})

						// Keep optimistic items not yet confirmed by server
						const optimisticItems = current.filter(
							(s) =>
								s.id.toString().startsWith('optimistic-') &&
								!merged.some((m) => m.id === s.id)
						)

						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: [...merged, ...optimisticItems]
							}
						}
					}),

				addBlock: (afterId, block) =>
					set((state) => {
						const taskId = block.task_id
						const current = state.blocksByTask[taskId] ?? []

						let updatedList: BlockEntity[]

						if (!afterId) {
							// Insert at end
							updatedList = [...current, block]
						} else {
							const afterIndex = current.findIndex((s) => s.id === afterId)
							if (afterIndex === -1) {
								updatedList = [...current, block]
							} else {
								const result = [...current]
								result.splice(afterIndex + 1, 0, block)
								updatedList = result
							}
						}

						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: updatedList
							}
						}
					}),

				updateBlock: (id, taskId, patch) =>
					set((state) => {
						const current = state.blocksByTask[taskId] ?? []
						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: current.map((s) =>
									s.id === id ? { ...s, ...patch } : s
								)
							}
						}
					}),

				removeBlock: (id, taskId) =>
					set((state) => {
						const current = state.blocksByTask[taskId] ?? []
						const removedBlock = current.find((block) => block.id === id)
						const newParentId = removedBlock?.parent_id ?? null

						const updatedList = current
							.filter((block) => block.id !== id)
							.map((block) =>
								block.parent_id === id
									? { ...block, parent_id: newParentId }
									: block
							)

						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: updatedList
							}
						}
					}),

				moveBlock: (id, taskId, direction) =>
					set((state) => {
						const current = state.blocksByTask[taskId] ?? []
						const item = current.find((s) => s.id === id)
						if (!item) return state

						const parentId = item.parent_id ?? null
						const siblings = current.filter(
							(s) => (s.parent_id ?? null) === parentId
						)
						const siblingIndex = siblings.findIndex((s) => s.id === id)
						const targetSiblingIndex =
							direction === 'up' ? siblingIndex - 1 : siblingIndex + 1

						if (targetSiblingIndex < 0 || targetSiblingIndex >= siblings.length)
							return state

						const targetSibling = siblings[targetSiblingIndex]
						const beforeSibling =
							direction === 'up'
								? siblings[targetSiblingIndex - 1]
								: targetSibling
						const afterSibling =
							direction === 'up'
								? targetSibling
								: siblings[targetSiblingIndex + 1]

						const newSortOrder = generateKeyBetween(
							beforeSibling?.sort_order ?? null,
							afterSibling?.sort_order ?? null
						)

						const withoutItem = current.filter((s) => s.id !== id)
						const targetIndexInFull = withoutItem.findIndex(
							(s) => s.id === targetSibling.id
						)
						const insertAt =
							direction === 'up' ? targetIndexInFull : targetIndexInFull + 1

						const updatedList = [...withoutItem]
						updatedList.splice(insertAt, 0, {
							...item,
							sort_order: newSortOrder
						})

						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: updatedList
							}
						}
					}),

				reorderBlock: (id, taskId, newParentId, prevId, nextId) =>
					set((state) => {
						const current = state.blocksByTask[taskId] ?? []
						const item = current.find((s) => s.id === id)
						if (!item) return state

						const prevSibling = prevId
							? current.find((s) => s.id === prevId)
							: null
						const nextSibling = nextId
							? current.find((s) => s.id === nextId)
							: null

						const newSortOrder = generateKeyBetween(
							prevSibling?.sort_order ?? null,
							nextSibling?.sort_order ?? null
						)

						const withoutItem = current.filter((s) => s.id !== id)
						const anchorIndex = prevSibling
							? withoutItem.findIndex((s) => s.id === prevSibling.id)
							: nextSibling
								? withoutItem.findIndex((s) => s.id === nextSibling.id) - 1
								: withoutItem.length - 1

						const updatedList = [...withoutItem]
						updatedList.splice(anchorIndex + 1, 0, {
							...item,
							parent_id: newParentId,
							sort_order: newSortOrder
						})

						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: updatedList
							}
						}
					}),

				replaceOptimisticBlock: (tempId, taskId, realBlock) =>
					set((state) => {
						const current = state.blocksByTask[taskId] ?? []
						return {
							blocksByTask: {
								...state.blocksByTask,
								[taskId]: current.map((s) =>
									s.id === tempId
										? {
												...realBlock,
												text_content: s.text_content,
												stableKey: tempId
											}
										: s
								)
							}
						}
					}),

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
				name: 'block-storage',
				storage: createJSONStorage(() => blockZustandStorage),
				// Persist only the queue, not blocks (blocks are loaded from server)
				partialize: (state) => ({ pendingOperations: state.pendingOperations })
			}
		)
	)
)

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectBlocks = (taskId: TaskId | null) => (state: BlockStore) =>
	taskId ? (state.blocksByTask[taskId] ?? []) : []

export const selectPendingOperations = (state: BlockStore) =>
	state.pendingOperations

// ---------------------------------------------------------------------------
// Helper: generate sort_order for new block
// ---------------------------------------------------------------------------

export function generateBlockSortOrder(
	blocks: BlockEntity[],
	afterId: BlockId | null,
	parentId: BlockId | null = null
): string {
	const siblings = blocks
		.filter((item) => (item.parent_id ?? null) === parentId)
		.sort((a, b) => {
			const sortOrderA = a.sort_order ?? ''
			const sortOrderB = b.sort_order ?? ''
			return sortOrderA < sortOrderB ? -1 : sortOrderA > sortOrderB ? 1 : 0
		})

	if (siblings.length === 0) return generateKeyBetween(null, null)

	if (!afterId) {
		const last = siblings[siblings.length - 1]
		return generateKeyBetween(last?.sort_order ?? null, null)
	}

	const afterIndex = siblings.findIndex((item) => item.id === afterId)
	const afterBlock = afterIndex >= 0 ? siblings[afterIndex] : null
	const nextBlock = siblings[afterIndex + 1] ?? null

	return generateKeyBetween(
		afterBlock?.sort_order ?? null,
		nextBlock?.sort_order ?? null
	)
}
