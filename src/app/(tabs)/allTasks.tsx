import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { useTasksByCategory } from '@/features/TaskList/model'
import TaskCategoryGroup from '@/features/TaskList/TaskCategoryGroup'
import ScrollBox from '@/shared/ui/ScrollBox'
import { StyleSheet } from 'react-native-unistyles'

export default function AllTasksScreen() {
	const [searchQuery, setSearchQuery] = useState('')

	const { data: categoryGroups, isLoading, error } = useTasksByCategory()

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<ScrollBox>
			<View>
				{categoryGroups?.map((group) => (
					<TaskCategoryGroup
						key={group.category.id}
						group={group}
						searchQuery={searchQuery}
					/>
				))}
			</View>
			<View style={{ flexDirection: 'row' }}>
				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder='Поиск'
					style={{ width: 80, borderWidth: 1, padding: 8 }}
				/>

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
