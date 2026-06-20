import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supabaseClient } from '@/shared/api/supabaseClient'
import { type SubitemUpdate } from '@/shared/domain/subitem'

export const useUpdateSubitem = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (subitem: SubitemUpdate) => {
			const { error } = await supabaseClient
				.from('subitems')
				.update({ info: subitem.info })
				.eq('id', subitem.id)

			if (error) throw error
		},
		onSuccess: () => {
			// queryClient.invalidateQueries({ queryKey: ['task'] })
			// queryClient.invalidateQueries({ queryKey: ['subitems'] })
		}
	})
}
