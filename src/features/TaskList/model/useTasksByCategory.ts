import { useQuery } from '@tanstack/react-query'

import { CategoryId } from '@/shared/domain/ids'
import { CategoryEntity, TaskEntity } from '@/shared/domain/task'
import { categoryAPI } from '../repository/category.api'
import { taskAPI } from '../repository/task.api'
import { TaskCategoryGroupEntity } from './task.types'

/**
 * Group tasks by their categories hierarchically
 */
export const useTasksByCategory = () => {
	return useQuery({
		queryKey: ['tasks-by-category'],
		queryFn: async () => {
			const [tasks, categories] = await Promise.all([
				taskAPI.getAllTasks(),
				categoryAPI.getCategories()
			])
			return groupTasksByCategory(tasks, categories)
		}
	})
}

/**
 * Group tasks by categories and subcategories
 * Returns a hierarchical structure of categories with their tasks
 * Includes all tasks without parent_id (root tasks and tasks with subtasks)
 */
const groupTasksByCategory = (
	tasks: TaskEntity[],
	categories: CategoryEntity[]
): TaskCategoryGroupEntity[] => {
	// Filter tasks without parent_id (includes root tasks and tasks that have subtasks)
	const tasksWithoutParent = tasks.filter(
		(task) => task.parent_id === null || task.parent_id === undefined
	)

	// Build category map from all categories
	const categoryMap = new Map<CategoryId, CategoryEntity>()
	categories.forEach((category) => {
		categoryMap.set(category.id, category)
	})

	// Group tasks by category
	const tasksByCategory = new Map<CategoryId, TaskEntity[]>()
	tasksWithoutParent.forEach((task) => {
		if (task.category) {
			const existing = tasksByCategory.get(task.category.id) || []
			existing.push(task)
			tasksByCategory.set(task.category.id, existing)
		}
	})

	// Helper to find root category for a given category
	const findRootCategory = (categoryId: CategoryId): CategoryId | null => {
		const category = categoryMap.get(categoryId)
		if (!category) return null
		if (!category.parent_id || !categoryMap.has(category.parent_id)) {
			return categoryId
		}
		return findRootCategory(category.parent_id)
	}

	// Build hierarchical structure
	const rootCategories: TaskCategoryGroupEntity[] = []

	// Collect all root category IDs that have tasks
	const rootCategoryIds = new Set<CategoryId>()
	tasksByCategory.forEach((_, categoryId) => {
		const rootId = findRootCategory(categoryId)
		if (rootId) rootCategoryIds.add(rootId)
	})

	// Create groups for each root category
	rootCategoryIds.forEach((rootId) => {
		const rootCategory = categoryMap.get(rootId)!
		const group: TaskCategoryGroupEntity = {
			category: rootCategory,
			tasks: tasksByCategory.get(rootId) || []
		}

		// Find and add children categories
		const children = findCategoryChildren(rootId, categoryMap, tasksByCategory)
		if (children.length > 0) {
			group.children = children
		}

		rootCategories.push(group)
	})

	// Add tasks without category
	const tasksWithoutCategory = tasksWithoutParent.filter(
		(task) => !task.category
	)
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
