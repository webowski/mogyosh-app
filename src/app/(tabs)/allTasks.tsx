import { MaterialIcons } from '@expo/vector-icons'
import WheelPicker, {
	withVirtualized
} from '@quidone/react-native-wheel-picker'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	View
} from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import {
	getCategoryIdsWithSubcategories,
	useCategories,
	useTasks
} from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { formStyles } from '@/shared/styles/form'

const VirtualizedWheelPicker = withVirtualized(WheelPicker)

export default function AllTasksScreen() {
	const { theme } = useUnistyles()
	const { t, i18n } = useTranslation()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryEntity | null>(null)
	const [isUncategorized, setIsUncategorized] = useState(false)

	const { data: categories } = useCategories()

	const {
		data: tasks,
		isLoading,
		error
	} = useTasks({
		searchQuery: searchQuery.trim() || undefined,
		categoryId: isUncategorized
			? 'uncategorized'
			: selectedCategory && categories
				? getCategoryIdsWithSubcategories(selectedCategory.id, categories)
				: undefined
	})

	const pickerItems = useMemo(
		() => {
			const noCategory = { value: 'uncategorized', label: t('Uncategorized') }
			const allCategories = { value: null, label: t('All categories') }

			if (!categories || categories.length === 0) {
				return [allCategories, noCategory]
			}

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

			return [allCategories, noCategory, ...result]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[categories, i18n.language]
	)

	const handlePickerChange = (object: { item: { value: string | null } }) => {
		if (object.item.value === 'uncategorized') {
			setIsUncategorized(true)
			setSelectedCategory(null)
		} else {
			setIsUncategorized(false)
			const category =
				categories?.find((c) => c.id === object.item.value) ?? null
			setSelectedCategory(category)
		}
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
				<View style={{ position: 'relative' }}>
					<MaterialIcons
						name='search'
						size={20}
						color={theme.colors.minor}
						style={{
							position: 'absolute',
							left: 12,
							top: '50%',
							transform: [{ translateY: -9 }],
							zIndex: 1
						}}
					/>
					<TextInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder='Поиск'
						placeholderTextColor={theme.colors.minor}
						style={[formStyles.input, { paddingLeft: 38 }]}
					/>
				</View>
			</View>

			<FlatList
				data={tasks}
				keyExtractor={(item) => item.id}
				scrollEventThrottle={16}
				bounces={true}
				style={[commonStyles.scrollBox]}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: STYLE_VARS.sidePadding,
					// paddingTop: STYLE_VARS.sidePadding / 2,
					paddingBottom: STYLE_VARS.sidePadding / 2,
					gap: 4
				}}
				renderItem={({ item }) => <TaskListItem data={item} />}
				ListEmptyComponent={
					isLoading ? (
						<ActivityIndicator />
					) : error ? (
						<Text>Ошибка загрузки</Text>
					) : null
				}
			/>

			<View
				style={{
					paddingHorizontal: STYLE_VARS.sidePadding,
					paddingBottom: 34
				}}
			>
				<VirtualizedWheelPicker
					data={pickerItems}
					value={
						isUncategorized ? 'uncategorized' : (selectedCategory?.id ?? null)
					}
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
