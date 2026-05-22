import { supabaseClient } from '@/shared/api/supabaseClient'
import { CategoryId } from '@/shared/domain/ids'
import { CategoryEntity } from '@/shared/domain/task'

const getCategories = async (): Promise<CategoryEntity[]> => {
	const { data, error } = await supabaseClient
		.from('categories')
		.select('id, name, parent_id')

	if (error) throw error
	return data ?? []
}

type CreateCategoryPayload = {
	name: string
	parent_id?: CategoryId | null
}

const createCategory = async (
	payload: CreateCategoryPayload
): Promise<CategoryEntity> => {
	const { data: userData } = await supabaseClient.auth.getUser()
	const userId = userData?.user?.id

	const { data, error } = await supabaseClient
		.from('categories')
		.insert({
			name: payload.name,
			user_id: userId,
			parent_id: payload.parent_id ?? null
		})
		.select('id, name, parent_id')
		.single()

	if (error) throw error
	return data
}

export const categoryAPI = {
	getCategories,
	createCategory
}
