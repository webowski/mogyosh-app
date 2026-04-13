import { ActivityIndicator, SectionList, Text } from 'react-native'

import TaskItem from '@/features/TaskList/TaskItem'
import { textStyles } from '@/shared/styles/text'

import { useTasks } from './model/useTasks'

export default function DayTaskList() {
	const { data, isLoading, error } = useTasks()

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<>
			<SectionList
				sections={data ?? []}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <TaskItem data={item} />}
				renderSectionHeader={({ section: { title } }) => (
					<Text style={textStyles.heading5}>{title}</Text>
				)}
			/>
		</>
	)
}
