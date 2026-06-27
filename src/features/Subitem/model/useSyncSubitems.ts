import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { supabaseClient } from '@/shared/api/supabaseClient'
import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import {
	SubitemOperation,
	SubitemOperationUpdate,
	selectPendingOperations,
	useSubitemStore
} from './subitem.store'

const SYNC_DEBOUNCE_MS = 400

// ---------------------------------------------------------------------------
// API calls per operation type
// ---------------------------------------------------------------------------

const syncCreate = async (subitem: SubitemEntity, tempId: SubitemId) => {
	const { data, error } = await supabaseClient
		.from('subitems')
		.insert({
			info: subitem.info,
			task_id: subitem.task_id,
			parent_id: subitem.parent_id ?? null,
			type: subitem.type,
			sort_order: subitem.sort_order
		})
		.select()
		.single()

	if (error) throw error

	// Replace optimistic item with real one in store
	useSubitemStore
		.getState()
		.replaceOptimisticSubitem(tempId, subitem.task_id, data)

	return data
}

const syncUpdate = async (
	id: SubitemId,
	patch: SubitemOperationUpdate['patch']
) => {
	const { error } = await supabaseClient
		.from('subitems')
		.update(patch)
		.eq('id', id)

	if (error) throw error
}

const syncDelete = async (id: SubitemId) => {
	const { error } = await supabaseClient.from('subitems').delete().eq('id', id)
	if (error) throw error
}

// ---------------------------------------------------------------------------
// Flush queue
// ---------------------------------------------------------------------------

const flushQueue = async (operations: SubitemOperation[]) => {
	if (operations.length === 0) return

	const { dequeueOperations } = useSubitemStore.getState()

	const successfulOperations: SubitemOperation[] = []

	for (const operation of operations) {
		try {
			if (operation.type === 'create') {
				await syncCreate(operation.subitem, operation.tempId)
			} else if (operation.type === 'update') {
				await syncUpdate(operation.id, operation.patch)
			} else if (operation.type === 'delete') {
				await syncDelete(operation.id)
			}
			successfulOperations.push(operation)
		} catch (error) {
			console.error(
				`[SyncSubitems] Failed to sync operation:`,
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

export const useSyncSubitems = () => {
	const pendingOperations = useSubitemStore(selectPendingOperations)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isFlushing = useRef(false)

	const scheduleFlush = () => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(async () => {
			if (isFlushing.current) return
			isFlushing.current = true

			const operations = useSubitemStore.getState().pendingOperations
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
				const operations = useSubitemStore.getState().pendingOperations
				flushQueue(operations)
			}
		})

		return () => {
			subscription.remove()
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [])
}
