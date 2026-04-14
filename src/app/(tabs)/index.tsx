import { ActivityIndicator, SectionList, Text } from 'react-native'

import { useTasks } from '@/features/TaskList/model/useTasks'
import TaskItem from '@/features/TaskList/TaskItem'
import { commonStyles } from '@/shared/styles/common'
import { textStyles } from '@/shared/styles/text'

export default function DayScreen() {
	const { data, isLoading, error } = useTasks()

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<>
			<SectionList
				sections={data ?? []}
				style={commonStyles.mainArea}
				contentContainerStyle={{ gap: 8 }}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <TaskItem data={item} />}
				renderSectionHeader={({ section: { title } }) => (
					<Text style={textStyles.heading5}>{title}</Text>
				)}
			/>
		</>
	)
}
