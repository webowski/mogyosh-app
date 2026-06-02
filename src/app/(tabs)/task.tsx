import { ActivityIndicator, Text, View } from 'react-native'

import { buildSubitemTree } from '@/features/Subitem/model/subitem.utils'
import SubitemNode from '@/features/Subitem/SubitemNode'
import { useSubitems, useTaskById } from '@/features/TaskList'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles } from '@/shared/styles/common'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function TaskScreen() {
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	const { data: subitems, isLoading: isLoadingSubitems } =
		useSubitems(selectedTaskId)

	const subitemTree = buildSubitemTree(subitems ?? [])

	// Show loading state when waiting for task data
	if (isLoading || isLoadingSubitems)
		return (
			<View style={commonStyles.mainArea}>
				<ActivityIndicator />
			</View>
		)

	// Show error state
	if (error)
		return (
			<View style={commonStyles.mainArea}>
				<Text>
					Ошибка загрузки задачи:{' '}
					{error instanceof Error ? error.message : 'Неизвестная ошибка'}
				</Text>
			</View>
		)

	// Show not found state when no task data and not loading
	if (!data)
		return (
			<View style={commonStyles.mainArea}>
				<Text>Задача не найдена или не выбрана</Text>
			</View>
		)

	return (
		<ScrollBox>
			{subitemTree.map((subitemData) => (
				<SubitemNode
					key={subitemData.id}
					data={subitemData}
					depth={0}
					// variant='default'
					// variant='bulleted'
					variant='collapsible'
				/>
			))}
		</ScrollBox>
	)
}
