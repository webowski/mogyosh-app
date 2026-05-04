import { useState } from 'react'
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native-unistyles'

import { useCategories, useTasks } from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import { commonStyles, styleVars } from '@/shared/styles/common'

export default function AllTasksScreen() {
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

	const handlerFilterByCategory = (category: CategoryEntity | null) => {
		// Если нажали на уже выбранную категорию — сбрасываем фильтр
		if (selectedCategory?.id === category?.id) {
			setSelectedCategory(null)
		} else {
			setSelectedCategory(category)
		}
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
					paddingHorizontal: styleVars.sidePadding,
					paddingTop: styleVars.sidePadding / 2,
					paddingBottom: styleVars.sidePadding / 2,
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

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={[{ paddingBottom: 34, flexGrow: 0, flexBasis: 'auto' }]}
				// contentContainerStyle={styles.pills}
				contentContainerStyle={{
					paddingHorizontal: styleVars.sidePadding,
					gap: 6
				}}
			>
				<Pressable
					style={[
						styles.pill,
						selectedCategory === null && styles.pill__active
					]}
					onPress={() => handlerFilterByCategory(null)}
				>
					<Text
						style={[
							styles.pill__text,
							selectedCategory === null && styles.pill__text_active
						]}
					>
						Без категории
					</Text>
				</Pressable>
				{categories?.map((category) => (
					<Pressable
						key={category.id}
						style={[
							styles.pill,
							selectedCategory?.id === category.id && styles.pill__active
						]}
						onPress={() => handlerFilterByCategory(category)}
					>
						<Text
							style={[
								styles.pill__text,
								selectedCategory?.id === category.id && styles.pill__text_active
							]}
						>
							{category.name}
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	pills: {
		// flexDirection: 'row',
		gap: 8,
		paddingHorizontal: styleVars.sidePadding,
		backgroundColor: 'black'
	},
	pill: {
		backgroundColor: theme.colors.primary800,
		paddingVertical: 5,
		paddingHorizontal: 14,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: theme.colors.primary
	},
	pill__active: {
		color: theme.colors.inverse,
		backgroundColor: theme.colors.primary
	},
	pill__text: {
		fontSize: 14,
		fontWeight: 500,
		color: theme.colors.major
	},
	pill__text_active: {
		color: theme.colors.inverse
	}
}))
