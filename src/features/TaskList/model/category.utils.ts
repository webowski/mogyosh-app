import { CategoryEntity } from '@/shared/domain/task'

export const getCategoryIdsWithSubcategories = (
	categoryId: string,
	allCategories: CategoryEntity[]
): string[] => {
	const ids: string[] = [categoryId]
	const findSubcategories = (parentId: string) => {
		for (const category of allCategories) {
			if (category.parent_id === parentId) {
				ids.push(category.id)
				findSubcategories(category.id)
			}
		}
	}
	findSubcategories(categoryId)
	return ids
}
