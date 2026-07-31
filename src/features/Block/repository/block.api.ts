import { generateKeyBetween } from 'fractional-indexing'

import {
	setBlockDayState,
	setBlockPersistentState
} from '@/features/BlockState/repository/blockState.api'
import { supabaseClient } from '@/shared/api/supabaseClient'
import type {
	BlockCreatePayload,
	BlockEntity,
	BlockRow
} from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { decodeBlockSettingsFromHex } from '../model/blockSettingsCodec'

const SUBITEMS_SELECT = `
	*,
	block_states (
		block_id,
		month,
		encoding,
		state,
		created_at,
		updated_at
	)
`

const makeBlockObject = (blockRow: BlockRow): BlockEntity => ({
	id: blockRow.id,
	task_id: blockRow.task_id,
	parent_id: blockRow.parent_id,
	type: blockRow.type,
	text_content: blockRow.text_content,
	status: blockRow.status,
	settings: decodeBlockSettingsFromHex(blockRow.type, blockRow.settings),
	states: blockRow.block_states ?? [],
	priority: blockRow.priority,
	sort_order: blockRow.sort_order,
	created_at: blockRow.created_at,
	updated_at: blockRow.updated_at
})

/**
 * Get blocks for a specific task
 * @param taskId - Parent task ID
 */
const getBlocks = async (taskId: TaskId): Promise<BlockEntity[]> => {
	try {
		const { data, error } = await supabaseClient
			.from('blocks')
			.select(SUBITEMS_SELECT)
			.eq('task_id', taskId)
			.order('sort_order', { ascending: true })

		if (error) {
			console.error('Error fetching blocks:', error)
			throw error
		}

		const blocks = (data ?? []).map(makeBlockObject)
		return blocks
	} catch (error) {
		console.error('getBlocks caught error:', error)
		throw error
	}
}

type SetBlockCompletedParams = {
	blockId: BlockId
	date: Date
	completed: boolean
}

/**
 * Toggles a checkbox block's completion for a specific calendar day
 */
const setBlockCompleted = async ({
	blockId,
	date,
	completed
}: SetBlockCompletedParams): Promise<BlockEntity> => {
	await setBlockDayState({
		blockId,
		blockType: 'checkbox',
		date,
		state: completed
	})

	const { data, error } = await supabaseClient
		.from('blocks')
		.select(SUBITEMS_SELECT)
		.eq('id', blockId)
		.single()

	if (error) throw error
	return makeBlockObject(data)
}

const createBlock = async (
	payload: BlockCreatePayload
): Promise<BlockEntity> => {
	const { data, error } = await supabaseClient
		.from('blocks')
		.insert({
			text_content: payload.text_content,
			task_id: payload.task_id ?? null,
			parent_id: payload.parent_id ?? null,
			type: payload.type ?? 'p',
			sort_order: payload.sort_order ?? generateKeyBetween(null, null)
		})
		.select()
		.single()

	if (error) throw error
	return data
}

const deleteBlock = async (blockId: BlockId): Promise<void> => {
	const { error } = await supabaseClient
		.from('blocks')
		.delete()
		.eq('id', blockId)

	if (error) throw error
}

type SetBlockPersistentCompletedParams = {
	blockId: BlockId
	completed: boolean
}

const setBlockPersistentCompleted = async ({
	blockId,
	completed
}: SetBlockPersistentCompletedParams): Promise<BlockEntity> => {
	await setBlockPersistentState({
		blockId,
		blockType: 'checkbox',
		state: completed
	})

	const { data, error } = await supabaseClient
		.from('blocks')
		.select(SUBITEMS_SELECT)
		.eq('id', blockId)
		.single()

	if (error) throw error
	return makeBlockObject(data)
}

const getStatsBlocks = async (): Promise<BlockEntity[]> => {
	const { data, error } = await supabaseClient
		.from('blocks')
		.select(SUBITEMS_SELECT)
		.eq('status', 'active')

	if (error) throw error

	return (data ?? [])
		.map(makeBlockObject)
		.filter((block) => block.settings?.in_stats)
}

export const blockAPI = {
	getBlocks,
	setBlockCompleted,
	createBlock,
	deleteBlock,
	setBlockPersistentCompleted,
	getStatsBlocks
}
