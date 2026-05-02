import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { useTasks } from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import ScrollBox from '@/shared/ui/ScrollBox'
import { StyleSheet } from 'react-native-unistyles'

export default function AllTasksScreen() {
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: tasks,
		isLoading,
		error
	} = useTasks({
		searchQuery: searchQuery.trim() || undefined
	})

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
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Все</Text>
					</View>
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Заработок</Text>
					</View>
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Работа</Text>
					</View>
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Здоровье</Text>
					</View>
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Купить</Text>
					</View>
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Обучение</Text>
					</View>
					<View style={styles.pill}>
						<Text style={styles.pill__text}>Без категории</Text>
					</View>
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
	pill__text: {
		fontSize: 14,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
