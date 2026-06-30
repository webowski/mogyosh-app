import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemEntity } from '@/shared/domain/subitem'
import { motivationAPI } from '../repository/motivation.api'
import type {
	MotivationOperation,
	MotivationOperationUpdate
} from './motivation.store'
import {
	selectMotivationPendingOperations,
	useMotivationStore
} from './motivation.store'

const SYNC_DEBOUNCE_MS = 400

// ---------------------------------------------------------------------------
// API calls per operation type
// ---------------------------------------------------------------------------

const syncCreate = async (subitem: SubitemEntity, tempId: SubitemId) => {
	const data = await motivationAPI.createMotivationSubitem({
		info: subitem.info,
		type: subitem.type,
		parent_id: subitem.parent_id ?? null,
		sort_order: subitem.sort_order ?? ''
	})

	// Get current info from store (user may have typed while syncing)
	const { subitems } = useMotivationStore.getState()
	const currentSubitem = subitems.find((s) => s.id === tempId)
	const currentInfo = currentSubitem?.info ?? subitem.info

	useMotivationStore.getState().replaceOptimisticSubitem(tempId, {
		...data,
		info: currentInfo
	})

	// If user typed something while syncing — enqueue an update to persist it
	if (currentInfo !== subitem.info) {
		useMotivationStore.getState().enqueueOperation({
			type: 'update',
			id: data.id,
			patch: { info: currentInfo }
		})
	}
}

const syncUpdate = async (
	id: SubitemId,
	patch: MotivationOperationUpdate['patch']
) => {
	await motivationAPI.updateMotivationSubitem(id, patch)
}

const syncDelete = async (id: SubitemId) => {
	await motivationAPI.deleteMotivationSubitem(id)
}

// ---------------------------------------------------------------------------
// Flush queue
// ---------------------------------------------------------------------------

const flushQueue = async (operations: MotivationOperation[]) => {
	if (operations.length === 0) return

	const { dequeueOperations } = useMotivationStore.getState()

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

	const successfulOperations: MotivationOperation[] = []

	for (const operation of validOperations) {
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
				`[SyncMotivationSubitems] Failed to sync operation:`,
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

export const useSyncMotivationSubitems = () => {
	const pendingOperations = useMotivationStore(
		selectMotivationPendingOperations
	)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isFlushing = useRef(false)

	const scheduleFlush = () => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(async () => {
			if (isFlushing.current) return
			isFlushing.current = true

			const operations = useMotivationStore.getState().pendingOperations
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
				const operations = useMotivationStore.getState().pendingOperations
				flushQueue(operations)
			}
		})

		return () => {
			subscription.remove()
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [])
}
