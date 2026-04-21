import { useQuery } from '@tanstack/react-query'

import { getCategories } from './task.api'

export const useCategories = () => {
	return useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			return await getCategories()
		}
	})
}
