import { generateKeyBetween } from 'fractional-indexing'

import { supabaseClient } from '@/shared/api/supabaseClient'
import type {
	BlockCreatePayload,
	BlockEntity,
	BlockRow
} from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'

const SUBITEMS_SELECT = `
	*,
	block_states (
		id,
		state,
		state_date,
		created_at
	)
`

const makeBlockObject = (blockRow: BlockRow): BlockEntity => ({
	id: blockRow.id,
	task_id: blockRow.task_id,
	parent_id: blockRow.parent_id,
	type: blockRow.type,
	text_content: blockRow.text_content,
	status: blockRow.status,
	settings: blockRow.settings,
	state: blockRow.block_states?.[0]?.state ?? null,
	priority: blockRow.priority,
	sort_order: blockRow.sort_order,
	// schedules: blockRow.schedules,
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
		// .order('created_at', { ascending: true })

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

/**
 * Update block state (done/active/archived)
 * @param blockId - Block ID to update
 * @param state - New state value
 */
const updateBlockState = async (
	blockId: BlockId,
	state: 'done' | 'active' | 'archived'
): Promise<BlockEntity> => {
	// Check if state record exists for this block
	const { data: existingState, error: checkError } = await supabaseClient
		.from('block_states')
		.select('id')
		.eq('block_id', blockId)
		.single()

	if (checkError && checkError.code !== 'PGRST116') {
		throw checkError
	}

	if (existingState) {
		// Update existing state record
		const { error: updateError } = await supabaseClient
			.from('block_states')
			.update({
				state,
				state_date: new Date().toISOString()
			})
			.eq('block_id', blockId)

		if (updateError) throw updateError
	} else {
		// Insert new state record
		const { error: insertError } = await supabaseClient
			.from('block_states')
			.insert({
				block_id: blockId,
				state,
				state_date: new Date().toISOString()
			})

		if (insertError) throw insertError
	}

	// Fetch updated block with all relations
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

export const blockAPI = {
	getBlocks,
	updateBlockState,
	createBlock,
	deleteBlock
}
