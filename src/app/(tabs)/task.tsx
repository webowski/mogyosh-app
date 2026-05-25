import { ActivityIndicator, Text, View } from 'react-native'

import {
	useSubitems,
	useTaskById,
	useUpdateSubitemState
} from '@/features/TaskList'
import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles } from '@/shared/styles/common'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function TaskScreen() {
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	const { data: subitems, isLoading: isLoadingSubitems } =
		useSubitems(selectedTaskId)

	const updateSubitemState = useUpdateSubitemState()

	const handleToggleSubitem = (taskId: string, completed: boolean) => {
		updateSubitemState.mutate({
			taskId,
			state: completed ? 'done' : 'active'
		})
	}

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
			{subitems?.map((subitem) => (
				<ChecklistItem
					key={subitem.id}
					checked={subitem.state === 'done'}
					text={subitem.info}
					onToggle={(value) => handleToggleSubitem(subitem.id, value)}
				/>
			))}
		</ScrollBox>
	)
}
