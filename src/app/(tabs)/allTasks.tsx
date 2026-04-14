import { ActivityIndicator, FlatList, Text } from 'react-native'

import { useTasks } from '@/features/TaskList/model/useTasks'
import { TaskInput } from '@/features/TaskList/TaskInput'
import TaskListItem from '@/features/TaskList/TaskListItem'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AllTasksScreen() {
	const { data, isLoading, error } = useTasks()

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<ScrollBox>
			<TaskInput />

			<FlatList
				data={data}
				keyExtractor={(item, index) => 'index' + index}
				renderItem={({ item }) => <TaskListItem data={item} />}
			/>
		</ScrollBox>
	)
}
