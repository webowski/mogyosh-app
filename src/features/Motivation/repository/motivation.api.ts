import { supabaseClient } from '@/shared/api/supabaseClient'

export type MotivationSubitem = {
	id: string
	parent_id: string | null
	user_id: string
	info: string
	type: string
}

const getMotivationSubitems = async (): Promise<MotivationSubitem[]> => {
	try {
		const { data: userData } = await supabaseClient.auth.getUser()
		const userId = userData?.user?.id

		if (!userId) {
			return []
		}

		const { data, error } = await supabaseClient
			.from('motivation_subitems')
			.select('*')
			.eq('user_id', userId)
			.is('parent_id', null)
			.order('created_at', { ascending: true })

		if (error) {
			console.error('getMotivationSubitems error:', error)
			throw error
		}

		return (data ?? []) as MotivationSubitem[]
	} catch (error) {
		console.error('getMotivationSubitems caught error:', error)
		throw error
	}
}

export const motivationAPI = {
	getMotivationSubitems
}
