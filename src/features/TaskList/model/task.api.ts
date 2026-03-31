import { supabase } from '@/shared/api/supabase'

export type Task = {
	id: string
	title: string
}

export const getTasks = async (): Promise<Task[]> => {
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.order('created_at', { ascending: false })

	if (error) throw error
	return data ?? []
}

export const createTask = async (title: string): Promise<Task> => {
	const { data: userData } = await supabase.auth.getUser()
	const userId = userData?.user?.id

	const { data, error } = await supabase
		.from('tasks')
		.insert({ title, user_id: userId })
		.select()
		.single()

	if (error) throw error
	return data
}
