import WheelPicker, {
	withVirtualized
} from '@quidone/react-native-wheel-picker'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { useCategories, useTasks } from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { useTranslation } from 'react-i18next'
import { useUnistyles } from 'react-native-unistyles'

const VirtualizedWheelPicker = withVirtualized(WheelPicker)

export default function AllTasksScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

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
		categoryId: selectedCategory?.id || undefined
	})

	// const handlerFilterByCategory = (category: CategoryEntity | null) => {
	// 	// Если нажали на уже выбранную категорию — сбрасываем фильтр
	// 	if (selectedCategory?.id === category?.id) {
	// 		setSelectedCategory(null)
	// 	} else {
	// 		setSelectedCategory(category)
	// 	}
	// }

	const pickerItems = useMemo(
		() => {
			const noCategory = { value: null, label: t('Uncategorized') }
			const allCategories = { value: null, label: t('All categories') }

			const categoriesSet =
				categories?.map((c) => ({ value: c.id, label: c.name })) ?? []

			return [allCategories, ...categoriesSet, noCategory]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[categories]
	)

	const handlePickerChange = (object: { item: { value: string | null } }) => {
		const category = categories?.find((c) => c.id === object.item.value) ?? null
		setSelectedCategory(category)
	}

	return (
		<>
			<View
				style={[
					commonStyles.mainArea,
					{ paddingBottom: 16, flexGrow: 0, flexBasis: 'auto' }
				]}
			>
				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder='Поиск'
					style={commonStyles.input}
				/>
			</View>

			<ScrollView
				style={commonStyles.scrollBox}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: STYLE_VARS.sidePadding,
					paddingTop: STYLE_VARS.sidePadding / 2,
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
					paddingBottom: 34,
					flexGrow: 0
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
