import { useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

import { useTasks } from '@/features/TaskList/model/useTasks'
import { TaskInput } from '@/features/TaskList/TaskInput'
import TaskListItem from '@/features/TaskList/TaskListItem'
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
			<TaskInput />

			<View>
				{data?.map((section, sectionIndex) => (
					<View key={section.title}>
						<Text>{section.title}</Text>
						<FlatList
							data={section.data}
							keyExtractor={(item, index) => sectionIndex + '-' + index}
							renderItem={({ item }) => <TaskListItem data={item} />}
						/>
					</View>
				))}
			</View>
		</ScrollBox>
	)
}
