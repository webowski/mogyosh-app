import { ActivityIndicator, Text, View } from 'react-native'

import { useMotivationTask, useTaskSubtasks } from '@/features/TaskList'
import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import { useUpdateTaskState } from '@/features/TaskList/model/useUpdateTaskState'
import { commonStyles } from '@/shared/styles/common'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function MotivationScreen() {
	const { data, isLoading, error } = useMotivationTask()

	const { data: subtasks, isLoading: isLoadingSubtasks } = useTaskSubtasks(
		data?.id ?? null
	)

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
				<Text>Мотивационная задача не найдена</Text>
			</View>
		)

	return (
		<ScrollBox>
			{subtasks?.map((subtask) => (
				<ChecklistItem
					key={subtask.id}
					checked={subtask.state === 'done'}
					text={subtask.info}
					onToggle={(value) => handleToggleSubtask(subtask.id, value)}
				/>
			))}
		</ScrollBox>
	)
}
