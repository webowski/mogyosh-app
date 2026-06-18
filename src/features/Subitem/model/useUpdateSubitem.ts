import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supabaseClient } from '@/shared/api/supabaseClient'
import { type SubitemInsert } from '@/shared/domain/subitem'

export const useUpdateSubitem = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, info }: SubitemInsert) => {
			const { error } = await supabaseClient
				.from('subitems')
				.update({ info })
				.eq('id', id)

			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['task'] })
			queryClient.invalidateQueries({ queryKey: ['subitems'] })
		}
	})
}
