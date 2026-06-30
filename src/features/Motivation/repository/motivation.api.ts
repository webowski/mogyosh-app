import { supabaseClient } from '@/shared/api/supabaseClient'
import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemEntity, SubitemType } from '@/shared/domain/subitem'
import { MOTIVATION_TASK_ID } from '../model/motivation.store'

// ---------------------------------------------------------------------------
// Map DB row → SubitemEntity (with virtual task_id)
// ---------------------------------------------------------------------------

const makeMotivationSubitemEntity = (
	row: Record<string, unknown>
): SubitemEntity => ({
	id: row.id as SubitemId,
	task_id: MOTIVATION_TASK_ID,
	parent_id: (row.parent_id as SubitemId) ?? null,
	type: (row.type as SubitemType) ?? 'ul',
	info: (row.info as string) ?? '',
	status: null,
	settings: (row.settings as SubitemEntity['settings']) ?? null,
	state: null,
	priority: null,
	sort_order: (row.sort_order as string) ?? null,
	created_at: row.created_at as string,
	updated_at: (row.updated_at as string) ?? null
})

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

const getMotivationSubitems = async (): Promise<SubitemEntity[]> => {
	const { data: userData } = await supabaseClient.auth.getUser()
	const userId = userData?.user?.id

	if (!userId) return []

	const { data, error } = await supabaseClient
		.from('motivation_subitems')
		.select('*')
		.eq('user_id', userId)
		.order('sort_order', { ascending: true })

	if (error) {
		console.error('getMotivationSubitems error:', error)
		throw error
	}

	return (data ?? []).map(makeMotivationSubitemEntity)
}

const createMotivationSubitem = async (payload: {
	info: string
	type: SubitemType
	parent_id: SubitemId | null
	sort_order: string
}): Promise<SubitemEntity> => {
	const { data: userData } = await supabaseClient.auth.getUser()
	const userId = userData?.user?.id

	if (!userId) throw new Error('User not authenticated')

	const { data, error } = await supabaseClient
		.from('motivation_subitems')
		.insert({
			user_id: userId,
			info: payload.info,
			type: payload.type,
			parent_id: payload.parent_id ?? null,
			sort_order: payload.sort_order
		})
		.select()
		.single()

	if (error) throw error

	return makeMotivationSubitemEntity(data)
}

const updateMotivationSubitem = async (
	id: SubitemId,
	patch: Partial<
		Pick<SubitemEntity, 'info' | 'type' | 'sort_order' | 'settings'>
	>
): Promise<void> => {
	const { error } = await supabaseClient
		.from('motivation_subitems')
		.update(patch)
		.eq('id', id)

	if (error) throw error
}

const deleteMotivationSubitem = async (id: SubitemId): Promise<void> => {
	const { error } = await supabaseClient
		.from('motivation_subitems')
		.delete()
		.eq('id', id)

	if (error) throw error
}

export const motivationAPI = {
	getMotivationSubitems,
	createMotivationSubitem,
	updateMotivationSubitem,
	deleteMotivationSubitem
}
