import { supabaseClient } from '@/shared/api/supabaseClient'
import { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemEntity, SubitemRow } from '@/shared/domain/subitem'

const SUBITEMS_SELECT = `
	*,
	subitem_states (
		id,
		state,
		state_date,
		created_at
	)
`

const makeSubitemObject = (subitemRow: SubitemRow): SubitemEntity => ({
	id: subitemRow.id,
	task_id: subitemRow.task_id,
	parent_id: subitemRow.parent_id,
	type: subitemRow.type,
	info: subitemRow.info,
	status: subitemRow.status,
	state: subitemRow.subitem_states?.[0]?.state ?? null,
	priority: subitemRow.priority,
	sort_order: subitemRow.sort_order,
	// schedules: subitemRow.schedules,
	created_at: subitemRow.created_at,
	updated_at: subitemRow.updated_at
})

/**
 * Get subitems for a specific task
 * @param taskId - Parent task ID
 */
const getSubitems = async (taskId: TaskId): Promise<SubitemEntity[]> => {
	try {
		const { data, error } = await supabaseClient
			.from('subitems')
			.select(SUBITEMS_SELECT)
			.eq('task_id', taskId)
			.order('created_at', { ascending: true })

		if (error) {
			console.error('Error fetching subitems:', error)
			throw error
		}

		const subitems = (data ?? []).map(makeSubitemObject)
		return subitems
	} catch (error) {
		console.error('getSubitems caught error:', error)
		throw error
	}
}

/**
 * Update subitem state (done/active/archived)
 * @param subitemId - Subitem ID to update
 * @param state - New state value
 */
const updateSubitemState = async (
	subitemId: SubitemId,
	state: 'done' | 'active' | 'archived'
): Promise<SubitemEntity> => {
	// Check if state record exists for this subitem
	const { data: existingState, error: checkError } = await supabaseClient
		.from('subitem_states')
		.select('id')
		.eq('subitem_id', subitemId)
		.single()

	if (checkError && checkError.code !== 'PGRST116') {
		throw checkError
	}

	if (existingState) {
		// Update existing state record
		const { error: updateError } = await supabaseClient
			.from('subitem_states')
			.update({
				state,
				state_date: new Date().toISOString()
			})
			.eq('subitem_id', subitemId)

		if (updateError) throw updateError
	} else {
		// Insert new state record
		const { error: insertError } = await supabaseClient
			.from('subitem_states')
			.insert({
				subitem_id: subitemId,
				state,
				state_date: new Date().toISOString()
			})

		if (insertError) throw insertError
	}

	// Fetch updated subitem with all relations
	const { data, error } = await supabaseClient
		.from('subitems')
		.select(SUBITEMS_SELECT)
		.eq('id', subitemId)
		.single()

	if (error) throw error
	return makeSubitemObject(data)
}

type CreateSubitemPayload = {
	info: string
	task_id?: string | null
}

const createSubitem = async (
	payload: CreateSubitemPayload
): Promise<SubitemEntity> => {
	const { data, error } = await supabaseClient
		.from('subitems')
		.insert({
			info: payload.info,
			task_id: payload.task_id ?? null
		})
		.select()
		.single()

	if (error) throw error
	return data
}

export const subitemAPI = {
	getSubitems,
	updateSubitemState,
	createSubitem
}
