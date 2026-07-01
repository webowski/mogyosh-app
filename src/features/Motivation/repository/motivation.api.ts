import { supabaseClient } from '@/shared/api/supabaseClient'
import type { TaskId } from '@/shared/domain/ids'

const getOrCreateMotivationTask = async (): Promise<TaskId> => {
	const { data, error } = await supabaseClient.rpc(
		'get_or_create_motivation_task'
	)

	if (error) throw error

	return data as TaskId
}

export const motivationAPI = {
	getOrCreateMotivationTask
}
