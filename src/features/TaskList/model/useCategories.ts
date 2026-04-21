import { useQuery } from '@tanstack/react-query'

import { CategoryEntity } from '@/shared/domain/task'
import { useCategoriesStore } from './categoriesStore'
import { getCategories } from './task.api'

export const useCategories = () => {
	const setCategories = useCategoriesStore((state) => state.setCategories)

	return useQuery<CategoryEntity[]>({
		queryKey: ['categories'],
		queryFn: getCategories,

		select: (data) => {
			setCategories(data) // синхронизация
			return data
		}
	})
}
