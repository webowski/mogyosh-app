import { supabase } from '@/shared/api/supabase'
import { TaskEntity } from '@/shared/domain/task'

export const getTasks = async (): Promise<TaskEntity[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.order('created_at', { ascending: false })

	if (error) throw error
	return data ?? []
}

export const createTask = async (info: string): Promise<TaskEntity> => {
	const { data: userData } = await supabase.auth.getUser()
	const userId = userData?.user?.id

	const { data, error } = await supabase
		.from('tasks')
		.insert({ info, user_id: userId })
		.select()
		.single()

	if (error) throw error
	return data
}
