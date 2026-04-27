import { useQuery } from '@tanstack/react-query'

import { CategoryId } from '@/shared/domain/ids'
import { CategoryEntity, TaskEntity } from '@/shared/domain/task'
import { getAllTasks } from './task.api'

export type TaskCategoryGroupEntity = {
	category: CategoryEntity
	tasks: TaskEntity[]
	children?: TaskCategoryGroupEntity[]
}

/**
 * Group tasks by their categories hierarchically
 */
export const useTasksByCategory = () => {
	return useQuery({
		queryKey: ['tasks-by-category'],
		queryFn: async () => {
			const tasks = await getAllTasks()
			return groupTasksByCategory(tasks)
		}
	})
}

/**
 * Group tasks by categories and subcategories
 * Returns a hierarchical structure of categories with their tasks
 */
const groupTasksByCategory = (
	tasks: TaskEntity[]
): TaskCategoryGroupEntity[] => {
	// Build category map
	const categoryMap = new Map<CategoryId, CategoryEntity>()
	tasks.forEach((task) => {
		if (task.category && !categoryMap.has(task.category.id)) {
			categoryMap.set(task.category.id, task.category)
		}
	})

	// Group tasks by category
	const tasksByCategory = new Map<CategoryId, TaskEntity[]>()
	tasks.forEach((task) => {
		if (task.category) {
			const existing = tasksByCategory.get(task.category.id) || []
			existing.push(task)
			tasksByCategory.set(task.category.id, existing)
		}
	})

	// Build hierarchical structure
	const rootCategories: TaskCategoryGroupEntity[] = []

	categoryMap.forEach((category) => {
		if (!category.parent_id) {
			const group: TaskCategoryGroupEntity = {
				category,
				tasks: tasksByCategory.get(category.id) || []
			}

			// Find and add children categories
			const children = findCategoryChildren(
				category.id,
				categoryMap,
				tasksByCategory
			)
			if (children.length > 0) {
				group.children = children
			}

			rootCategories.push(group)
		}
	})

	// Add tasks without category
	const tasksWithoutCategory = tasks.filter((task) => !task.category)
	if (tasksWithoutCategory.length > 0) {
		rootCategories.push({
			category: {
				id: 'uncategorized' as CategoryId,
				name: 'Без категории',
				parent_id: null
			},
			tasks: tasksWithoutCategory
		})
	}

	return rootCategories
}

/**
 * Recursively find children categories
 */
const findCategoryChildren = (
	parentId: CategoryId,
	categoryMap: Map<CategoryId, CategoryEntity>,
	tasksByCategory: Map<CategoryId, TaskEntity[]>
): TaskCategoryGroupEntity[] => {
	const children: TaskCategoryGroupEntity[] = []

	categoryMap.forEach((category) => {
		if (category.parent_id === parentId) {
			const group: TaskCategoryGroupEntity = {
				category,
				tasks: tasksByCategory.get(category.id) || []
			}

			// Recursively find grandchildren
			const grandchildren = findCategoryChildren(
				category.id,
				categoryMap,
				tasksByCategory
			)
			if (grandchildren.length > 0) {
				group.children = grandchildren
			}

			children.push(group)
		}
	})

	return children
}
