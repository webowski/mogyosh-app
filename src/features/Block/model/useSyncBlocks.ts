import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { supabaseClient } from '@/shared/api/supabaseClient'
import { BlockEntity } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import {
	BlockOperation,
	BlockOperationUpdate,
	selectPendingOperations,
	useBlockStore
} from './block.store'
import {
	decodeBlockSettingsFromHex,
	encodeBlockSettingsToHex
} from './blockSettingsCodec'

const SYNC_DEBOUNCE_MS = 400

// ---------------------------------------------------------------------------
// API calls per operation type
// ---------------------------------------------------------------------------

const syncCreate = async (block: BlockEntity, tempId: BlockId) => {
	const { data, error } = await supabaseClient
		.from('blocks')
		.insert({
			text_content: block.text_content,
			task_id: block.task_id,
			parent_id: block.parent_id ?? null,
			type: block.type,
			sort_order: block.sort_order,
			settings: encodeBlockSettingsToHex(block.type, block.settings ?? {})
		})
		.select()
		.single()

	if (error) throw error

	const { blocksByTask } = useBlockStore.getState()
	const taskBlocks = blocksByTask[block.task_id] ?? []
	const currentBlock = taskBlocks.find((s) => s.id === tempId)
	const currentInfo = currentBlock?.text_content ?? block.text_content

	useBlockStore.getState().replaceOptimisticBlock(tempId, block.task_id, {
		...data,
		settings: decodeBlockSettingsFromHex(data.type, data.settings),
		text_content: currentInfo
	})

	if (currentInfo !== block.text_content) {
		useBlockStore.getState().enqueueOperation({
			type: 'update',
			id: data.id,
			taskId: block.task_id,
			patch: { text_content: currentInfo }
		})
	}

	return data
}

const syncUpdate = async (
	id: BlockId,
	taskId: TaskId,
	patch: BlockOperationUpdate['patch']
) => {
	let dbPatch: Record<string, unknown> = { ...patch }

	if (patch.settings) {
		const blockType =
			useBlockStore
				.getState()
				.blocksByTask[taskId]?.find((block) => block.id === id)?.type ??
			patch.type ??
			'p'

		dbPatch = {
			...dbPatch,
			settings: encodeBlockSettingsToHex(blockType, patch.settings)
		}
	}

	const { error } = await supabaseClient
		.from('blocks')
		.update(dbPatch)
		.eq('id', id)

	if (error) throw error
}

const syncDelete = async (id: BlockId) => {
	const { error } = await supabaseClient.from('blocks').delete().eq('id', id)
	if (error) throw error
}

// ---------------------------------------------------------------------------
// Flush queue
// ---------------------------------------------------------------------------

const flushQueue = async (operations: BlockOperation[]) => {
	if (operations.length === 0) return

	const { dequeueOperations } = useBlockStore.getState()

	const invalidOperations = operations.filter(
		(op) =>
			(op.type === 'update' && !op.patch) ||
			(op.type !== 'create' && op.id?.toString().startsWith('optimistic-'))
	)
	if (invalidOperations.length > 0) {
		dequeueOperations(invalidOperations)
	}

	const validOperations = operations.filter(
		(op) => !invalidOperations.includes(op)
	)
	if (validOperations.length === 0) return

	const successfulOperations: BlockOperation[] = []

	for (const operation of validOperations) {
		try {
			if (operation.type === 'create') {
				await syncCreate(operation.block, operation.tempId)
			} else if (operation.type === 'update') {
				await syncUpdate(operation.id, operation.taskId, operation.patch)
			} else if (operation.type === 'delete') {
				await syncDelete(operation.id)
			}
			successfulOperations.push(operation)
		} catch (error) {
			console.error(
				`[SyncBlocks] Failed to sync operation:`,
				operation.type,
				error
			)
			// Leave failed operations in queue to retry
		}
	}

	dequeueOperations(successfulOperations)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useSyncBlocks = () => {
	const pendingOperations = useBlockStore(selectPendingOperations)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isFlushing = useRef(false)

	const scheduleFlush = () => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(async () => {
			if (isFlushing.current) return
			isFlushing.current = true

			const operations = useBlockStore.getState().pendingOperations
			await flushQueue(operations)

			isFlushing.current = false
		}, SYNC_DEBOUNCE_MS)
	}

	// Flush when queue changes
	useEffect(() => {
		if (pendingOperations.length > 0) {
			scheduleFlush()
		}
	}, [pendingOperations])

	// Flush immediately when app goes to background
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState) => {
			if (nextState === 'background' || nextState === 'inactive') {
				if (timerRef.current) clearTimeout(timerRef.current)
				const operations = useBlockStore.getState().pendingOperations
				flushQueue(operations)
			}
		})

		return () => {
			subscription.remove()
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [])
}
