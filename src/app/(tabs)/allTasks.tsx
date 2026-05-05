import WheelPicker, {
	withVirtualized
} from '@quidone/react-native-wheel-picker'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import {
	getCategoryIdsWithSubcategories,
	useCategories,
	useTasks
} from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { formStyles } from '@/shared/styles/form'
import { useTranslation } from 'react-i18next'
import { useUnistyles } from 'react-native-unistyles'

const VirtualizedWheelPicker = withVirtualized(WheelPicker)

export default function AllTasksScreen() {
	const { theme } = useUnistyles()
	const { t, i18n } = useTranslation()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryEntity | null>(null)

	const { data: categories } = useCategories()

	const {
		data: tasks,
		isLoading,
		error
	} = useTasks({
		searchQuery: searchQuery.trim() || undefined,
		categoryId:
			selectedCategory && categories
				? getCategoryIdsWithSubcategories(selectedCategory.id, categories)
				: undefined
	})

	// const handlerFilterByCategory = (category: CategoryEntity | null) => {
	// 	// Если нажали на уже выбранную категорию — сбрасываем фильтр
	// 	if (selectedCategory?.id === category?.id) {
	// 		setSelectedCategory(null)
	// 	} else {
	// 		setSelectedCategory(category)
	// 	}
	// }

	const pickerItems = useMemo(() => {
		const noCategory = { value: null, label: t('Uncategorized') }
		const allCategories = { value: null, label: t('All categories') }

		if (!categories || categories.length === 0) {
			return [allCategories, noCategory]
		}

		// const categoryMap = new Map(categories.map((c) => [c.id, c]))
		const visited = new Set<string>()
		const result: { value: string | null; label: string }[] = []

		const buildCategoriesTree = (parentId: string | null, depth: number) => {
			for (const category of categories) {
				if (category.parent_id !== parentId || visited.has(category.id)) {
					continue
				}
				visited.add(category.id)

				const prefix = depth > 0 ? ' — '.repeat(depth) : ''
				result.push({ value: category.id, label: prefix + category.name })

				buildCategoriesTree(category.id, depth + 1)
			}
		}

		buildCategoriesTree(null, 0)

		return [allCategories, ...result, noCategory]
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categories, i18n.language])

	const handlePickerChange = (object: { item: { value: string | null } }) => {
		const category = categories?.find((c) => c.id === object.item.value) ?? null
		setSelectedCategory(category)
	}

	return (
		<>
			<View
				style={[
					{
						paddingHorizontal: STYLE_VARS.sidePadding,
						paddingTop: STYLE_VARS.sidePadding,
						paddingBottom: STYLE_VARS.sidePadding
					}
				]}
			>
				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder='Поиск'
					style={formStyles.input}
				/>
			</View>

			<ScrollView
				style={[commonStyles.scrollBox]}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: STYLE_VARS.sidePadding,
					// paddingTop: STYLE_VARS.sidePadding / 2,
					paddingBottom: STYLE_VARS.sidePadding / 2,
					gap: 4
				}}
			>
				{isLoading ? (
					<ActivityIndicator />
				) : error ? (
					<Text>Ошибка загрузки</Text>
				) : (
					tasks?.map((task) => <TaskListItem key={task.id} data={task} />)
				)}
			</ScrollView>

			<View
				style={{
					paddingHorizontal: STYLE_VARS.sidePadding,
					paddingBottom: 34
				}}
			>
				<VirtualizedWheelPicker
					data={pickerItems}
					value={selectedCategory?.id ?? null}
					onValueChanged={handlePickerChange}
					itemHeight={40}
					visibleItemCount={3}
					// contentContainerStyle={{
					// 	// backgroundColor: theme.colors.primary
					// }}
					overlayItemStyle={{
						backgroundColor: theme.colors.primary,
						opacity: 0.2
					}}
					itemTextStyle={{
						paddingHorizontal: STYLE_VARS.inputPadding,
						textAlign: 'left',
						fontSize: 16,
						fontWeight: 500,
						color: theme.colors.major
					}}
				/>
			</View>
		</>
	)
}
