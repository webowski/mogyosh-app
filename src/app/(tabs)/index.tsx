import { RefreshControl, SectionList, Text, View } from 'react-native'

import { useTasksGrouped } from '@/features/TaskList'
import { useCategories } from '@/features/TaskList/model/useCategories'
import TaskItem from '@/features/TaskList/TaskItem'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { textStyles } from '@/shared/styles/text'
import Skeleton from '@/shared/ui/Skeleton'

export default function DayScreen() {
	const { data, isLoading, error, refetch } = useTasksGrouped()
	const { isLoading: catLoading, error: catError } = useCategories()

	if (error || catError) return <Text>Ошибка загрузки</Text>
	if (isLoading || catLoading) {
		return (
			<View style={commonStyles.mainArea}>
				<Skeleton />
			</View>
		)
	}

	return (
		<SectionList
			sections={data ?? []}
			style={{
				flex: 1,
				paddingHorizontal: STYLE_VARS.sidePadding,
				paddingTop: STYLE_VARS.sidePadding,
				paddingBottom: STYLE_VARS.sidePadding + STYLE_VARS.navPanelUnderlap,
				gap: 6
			}}
			overScrollMode='never'
			bounces={true}
			contentContainerStyle={{ gap: 4, flexShrink: 0 }}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => <TaskItem data={item} />}
			renderSectionHeader={({ section: { title } }) => (
				<View style={commonStyles.sectionHeader}>
					<Text style={textStyles.heading5}>{title}</Text>
				</View>
			)}
			refreshControl={
				<RefreshControl refreshing={isLoading} onRefresh={refetch} />
			}
		/>
	)
}
