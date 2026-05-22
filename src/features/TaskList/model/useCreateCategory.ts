import { useMutation, useQueryClient } from '@tanstack/react-query'

import { categoryAPI } from '../repository/category.api'

export const useCreateCategory = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: categoryAPI.createCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-category'] })
		}
	})
}
