import { supabaseClient } from '@/shared/api/supabaseClient'
import { CategoryEntity } from '@/shared/domain/task'

const getCategories = async (): Promise<CategoryEntity[]> => {
	const { data, error } = await supabaseClient
		.from('categories')
		.select('id, name, parent_id')

	if (error) throw error
	return data ?? []
}

export const categoryAPI = {
	getCategories
}
