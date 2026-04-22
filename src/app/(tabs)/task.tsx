import { ActivityIndicator, Text, View } from 'react-native'

import { useTaskById } from '@/features/TaskList/model/useTasks'
import { useTaskStore } from '@/shared/model/taskStore'
import ScrollBox from '@/shared/ui/ScrollBox'

/**
 * Экран "Задача" - отображает выбранную задачу и её подзадачи
 *
 * Параметры маршрута:
 * - taskId: ID выбранной задачи
 */
export default function TaskScreen() {
	// const { taskId } = useLocalSearchParams<{ taskId: string }>()
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	// const { data: subtasks, isLoading: isLoadingSubtasks } = useTaskSubtasks(
	// 	taskId || null
	// )

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки задачи</Text>
	if (!data) return <Text>Задача не найдена</Text>

	return (
		<ScrollBox>
			<View>
				<Text>{data.info}</Text>

				{/* <View>
					<Text>{task.info}</Text>
					{task.category && <Text>Категория: {task.category.name}</Text>}
					{task.priority !== null && task.priority !== undefined && (
						<Text>Приоритет: {task.priority}</Text>
					)}
					{task.status && <Text>Статус: {task.status}</Text>}
				</View>

				<View>
					<Text>Подзадачи</Text>
					{isLoadingSubtasks ? (
						<ActivityIndicator />
					) : subtasks && subtasks.length > 0 ? (
						subtasks.map((subtask) => (
							<TaskListItem key={subtask.id} data={subtask} />
						))
					) : (
						<Text>Нет подзадач</Text>
					)}
				</View> */}
			</View>
		</ScrollBox>
	)
}
