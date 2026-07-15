import { useMutation, useQueryClient } from '@tanstack/react-query'

import { categoryAPI } from '../repository/category.api'

export const useUpdateCategory = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: categoryAPI.updateCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
		}
	})
}
