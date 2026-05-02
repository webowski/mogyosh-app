import { useState } from 'react'
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View
} from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useCategories, useTasks } from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import ScrollBox from '@/shared/ui/ScrollBox'

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
		<ScrollBox>
			<TextInput
				value={searchQuery}
				onChangeText={setSearchQuery}
				placeholder='Поиск'
				style={styles.input}
			/>
			{isLoading ? (
				<ActivityIndicator />
			) : error ? (
				<Text>Ошибка загрузки</Text>
			) : (
				<View>
					{tasks?.map((task) => (
						<TaskListItem key={task.id} data={task} />
					))}
				</View>
			)}
			<View style={{ flexDirection: 'row' }}>
				<View style={styles.pills}>
					{categories?.map((category) => (
						<Pressable
							key={category.id}
							style={[
								styles.pill,
								selectedCategory?.id === category.id && styles.pill__active
							]}
							onPress={() => handlerFilterByCategory(category)}
						>
							<Text style={styles.pill__text}>{category.name}</Text>
						</Pressable>
					))}
					<Pressable
						style={[
							styles.pill,
							selectedCategory === null && styles.pill__active
						]}
						onPress={() => handlerFilterByCategory(null)}
					>
						<Text style={styles.pill__text}>Без категории</Text>
					</Pressable>
				</View>
			</View>
		</ScrollBox>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	input: {
		borderWidth: 1,
		padding: 8,
		border: 0,
		backgroundColor: theme.colors.background,
		borderRadius: 6
	},
	pills: {
		flexDirection: 'row',
		gap: 8
	},
	pill: {
		backgroundColor: theme.colors.primary800,
		paddingVertical: 5,
		paddingHorizontal: 16,
		borderRadius: 20
	},
	pill__active: {
		backgroundColor: theme.colors.primary
	},
	pill__text: {
		fontSize: 14,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
