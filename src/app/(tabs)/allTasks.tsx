import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { useTasksByCategory } from '@/features/TaskList/model'
import TaskCategoryGroup from '@/features/TaskList/TaskCategoryGroup'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AllTasksScreen() {
	const [searchQuery, setSearchQuery] = useState('')

	const { data: categoryGroups, isLoading, error } = useTasksByCategory()

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

				{categoryGroups?.map((group) => (
					<TaskCategoryGroup
						key={group.category.id}
						group={group}
						searchQuery={searchQuery}
					/>
				))}
			</View>
		</ScrollBox>
	)
}
