import { useMemo } from 'react'
import {
	ActivityIndicator,
	RefreshControl,
	SectionList,
	Text
} from 'react-native'

import { useCategories } from '@/features/TaskList/model/useCategories'
import { useTasksGrouped } from '@/features/TaskList/model/useTasks'
import TaskItem from '@/features/TaskList/TaskItem'
import { commonStyles } from '@/shared/styles/common'
import { textStyles } from '@/shared/styles/text'

export default function DayScreen() {
	const { data, isLoading, error, refetch } = useTasksGrouped()
	const categoriesObj = useCategories()

	const categoryMap = useMemo(
		() =>
			new Map(
				categoriesObj.data?.map((category) => {
					return [category.id, category]
				})
			),
		[categoriesObj.data]
	)

	if (isLoading || categoriesObj.isLoading) return <ActivityIndicator />
	if (error || categoriesObj.error) return <Text>Ошибка загрузки</Text>

	return (
		<SectionList
			sections={data ?? []}
			style={commonStyles.mainArea}
			contentContainerStyle={{ gap: 8 }}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => (
				<TaskItem data={item} categoryMap={categoryMap} />
			)}
			renderSectionHeader={({ section: { title } }) => (
				<Text style={textStyles.heading5}>{title}</Text>
			)}
			refreshControl={
				<RefreshControl refreshing={isLoading} onRefresh={refetch} />
			}
		/>
	)
}
