import { FlashList } from '@shopify/flash-list'
import { ActivityIndicator, Text, View } from 'react-native'

import { useTasks } from './model/useTasks'
import { TaskInput } from './TaskInput'
import TaskListItem from './TaskListItem'

export default function TaskList() {
	const { data, isLoading, error } = useTasks()

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<TaskInput />

			<FlashList
				data={data}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <TaskListItem data={item} />}
			/>
		</View>
	)
}
