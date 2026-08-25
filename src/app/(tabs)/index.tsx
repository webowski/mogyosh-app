import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, Text, View } from 'react-native'

import {
	TaskDragSortLayer,
	useTaskListViewStore,
	useTasksGrouped
} from '@/features/TaskList'
import { useCategories } from '@/features/TaskList/model/useCategories'
import TaskItem from '@/features/TaskList/TaskItem'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { textStyles } from '@/shared/styles/text'
import Skeleton from '@/shared/ui/Skeleton'

export default function DayScreen() {
	const { t } = useTranslation()
	const { data, isLoading, error, refetch } = useTasksGrouped()
	const { isLoading: catLoading, error: catError } = useCategories()
	const isSortMode = useTaskListViewStore((store) => store.isSortMode)

	const sections = useMemo(() => data ?? [], [data])

	if (error || catError)
		return (
			<View style={commonStyles.mainArea}>
				<Text>Ошибка загрузки</Text>
			</View>
		)

	if (isLoading || catLoading) {
		return (
			<View style={commonStyles.mainArea}>
				<Skeleton />
			</View>
		)
	}

	if (isSortMode) {
		const duringDayTasks =
			sections.find((section) => section.id === 'during_the_day')?.data ?? []

		return (
			<View
				style={[
					commonStyles.mainArea,
					{
						paddingHorizontal: STYLE_VARS.sidePadding,
						paddingTop: STYLE_VARS.sidePadding,
						paddingBottom:
							STYLE_VARS.sidePadding * 1.5 + STYLE_VARS.navPanelUnderlap
					}
				]}
			>
				<TaskDragSortLayer tasks={duringDayTasks} />
			</View>
		)
	}

	return (
		<SectionList
			style={{
				gap: 26
			}}
			contentContainerStyle={{
				gap: 4,
				paddingHorizontal: STYLE_VARS.sidePadding,
				paddingTop: STYLE_VARS.sidePadding,
				paddingBottom:
					STYLE_VARS.sidePadding * 1.5 + STYLE_VARS.navPanelUnderlap
			}}
			sections={sections}
			extraData={undefined}
			alwaysBounceVertical={false}
			bounces={false}
			contentInsetAdjustmentBehavior='never'
			overScrollMode='never'
			refreshing={false}
			scrollEventThrottle={16}
			showsVerticalScrollIndicator={false}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => <TaskItem data={item} />}
			renderSectionHeader={({ section: { title } }) => (
				<View style={commonStyles.sectionHeader}>
					<Text style={textStyles.heading5}>{t(`screen.day.${title}`)}</Text>
				</View>
			)}
		/>
	)
}
