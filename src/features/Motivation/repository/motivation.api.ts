import { supabaseClient } from '@/shared/api/supabaseClient'
import type { ItemId } from '@/shared/domain/ids'

const getOrCreateMotivationItem = async (): Promise<ItemId> => {
	const { data, error } = await supabaseClient.rpc(
		'get_or_create_motivation_task'
	)

	if (error) throw error

	return data as ItemId
}

export const motivationAPI = {
	getOrCreateMotivationItem
}
