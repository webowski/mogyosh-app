import { ActivityIndicator, Text, View } from 'react-native'

import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import { useTaskById, useTaskSubtasks } from '@/features/TaskList/model'
import { useUpdateTaskState } from '@/features/TaskList/model/useUpdateTaskState'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles } from '@/shared/styles/common'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function TaskScreen() {
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	const { data: subtasks, isLoading: isLoadingSubtasks } =
		useTaskSubtasks(selectedTaskId)

	const updateTaskState = useUpdateTaskState()

	const handleToggleSubtask = (taskId: string, completed: boolean) => {
		updateTaskState.mutate({
			taskId,
			state: completed ? 'done' : 'active'
		})
	}

	// Show loading state when waiting for task data
	if (isLoading || isLoadingSubtasks)
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
			<>
				<View>
					{subtasks &&
						subtasks.map((subtask) => (
							<ChecklistItem
								key={subtask.id}
								checked={subtask.state === 'done'}
								text={subtask.info}
								onToggle={(value) => handleToggleSubtask(subtask.id, value)}
							/>
						))}
				</View>
			</>
		</ScrollBox>
	)
}
