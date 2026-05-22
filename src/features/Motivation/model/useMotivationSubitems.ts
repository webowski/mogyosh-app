import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabaseClient } from '@/shared/api/supabaseClient'
import { motivationAPI } from '../repository/motivation.api'

/**
 * Get all motivation subitems for the current user
 */
export const useMotivationSubitems = () => {
	return useQuery({
		queryKey: ['motivation-subitems'],
		queryFn: async () => {
			try {
				const result = await motivationAPI.getMotivationSubitems()
				return result
			} catch (error) {
				console.error('useMotivationSubitems query error:', error)
				throw error
			}
		},
		retry: 2,
		staleTime: 5 * 60 * 1000 // 5 minutes
	})
}

/**
 * Update motivation subitem type (for toggle functionality)
 */
export const useUpdateMotivationSubitem = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, type }: { id: string; type: string }) => {
			const { error } = await supabaseClient
				.from('motivation_subitems')
				.update({ type })
				.eq('id', id)

			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['motivation-subitems'] })
		}
	})
}
