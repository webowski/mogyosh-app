import { CategoryEntity, CategoryMap } from '@/shared/domain/task'
import { create } from 'zustand'

type CategoriesState = {
	ids: string[]
	entities: CategoryMap
	setCategories: (data: CategoryEntity[]) => void
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
	ids: [],
	entities: {},

	setCategories: (data) => {
		const entities: CategoryMap = {}

		data.forEach((category) => {
			entities[category.id] = category
		})

		set({
			ids: data.map((category) => category.id),
			entities
		})
	}
}))
