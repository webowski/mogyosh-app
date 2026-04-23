import { ActivityIndicator, Text, View } from 'react-native'

import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import {
	useTaskById,
	useTaskSubtasks
} from '@/features/TaskList/model/useTasks'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles } from '@/shared/styles/common'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function TaskScreen() {
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	const { data: subtasks, isLoading: isLoadingSubtasks } =
		useTaskSubtasks(selectedTaskId)

	if (isLoading || isLoadingSubtasks)
		return (
			<View style={commonStyles.mainArea}>
				<ActivityIndicator />
			</View>
		)
	if (error)
		return (
			<View style={commonStyles.mainArea}>
				<Text>Ошибка загрузки задачи</Text>
			</View>
		)
	if (!data)
		return (
			<View style={commonStyles.mainArea}>
				<Text>Задача не найдена</Text>
			</View>
		)

	return (
		<ScrollBox>
			<>
				<View>
					{subtasks &&
						subtasks.map((subtask) => (
							<ChecklistItem key={subtask.id} data={subtask} />
						))}
				</View>
			</>
		</ScrollBox>
	)
}
