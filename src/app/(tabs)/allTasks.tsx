import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { useTasks } from '@/features/TaskList/model/useTasks'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AllTasksScreen() {
	const [searchQuery, setSearchQuery] = useState('')

	const { data, isLoading, error } = useTasks({
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

				{data?.map((task, taskIndex) => (
					<View key={task.id}>
						<Text>{task.info}</Text>
						{/* <FlatList
							data={task.data}
							keyExtractor={(item, index) => 'taskIndex' + '-' + index}
							renderItem={({ item }) => <TaskListItem data={item} />}
						/> */}
					</View>
				))}
			</View>
		</ScrollBox>
	)
}
