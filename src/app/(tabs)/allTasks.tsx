import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { useTasks } from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AllTasksScreen() {
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: tasks,
		isLoading,
		error
	} = useTasks({
		searchQuery: searchQuery || undefined
	})

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<ScrollBox>
			<View>
				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder='Поиск'
					style={{ flex: 1, borderWidth: 1, padding: 8 }}
				/>

				{tasks?.map((task) => (
					<TaskListItem key={task.id} data={task} />
				))}
			</View>
		</ScrollBox>
	)
}
