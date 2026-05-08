import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { CategoryEntity } from '@/shared/domain/task'
import { useCategoriesStore } from './categoriesStore'
import { getCategories } from './task.api'

export const useCategories = () => {
	const setCategories = useCategoriesStore((state) => state.setCategories)

	const query = useQuery<CategoryEntity[]>({
		queryKey: ['categories'],
		queryFn: getCategories,
		select: (data) => [...data].sort((a, b) => a.name.localeCompare(b.name))
	})

	useEffect(
		() => {
			if (query.data) {
				setCategories(query.data)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[query.data]
	)

	return query
}
