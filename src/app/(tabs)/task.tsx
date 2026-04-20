import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Text, View } from 'react-native'

import {
	useTaskById,
	useTaskSubtasks
} from '@/features/TaskList/model/useTasks'
import TaskListItem from '@/features/TaskList/TaskListItem'
import ScrollBox from '@/shared/ui/ScrollBox'

/**
 * Экран "Задача" - отображает выбранную задачу и её подзадачи
 *
 * Параметры маршрута:
 * - taskId: ID выбранной задачи
 */
export default function TaskScreen() {
	const { taskId } = useLocalSearchParams<{ taskId: string }>()

	const {
		data: task,
		isLoading: isLoadingTask,
		error
	} = useTaskById(taskId || null)
	const { data: subtasks, isLoading: isLoadingSubtasks } = useTaskSubtasks(
		taskId || null
	)

	if (isLoadingTask) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки задачи</Text>
	if (!task) return <Text>Задача не найдена</Text>

	return (
		<ScrollBox>
			<View>
				{/* Информация о задаче */}
				<View>
					<Text>{task.info}</Text>
					{task.category && <Text>Категория: {task.category.name}</Text>}
					{task.priority !== null && task.priority !== undefined && (
						<Text>Приоритет: {task.priority}</Text>
					)}
					{task.status && <Text>Статус: {task.status}</Text>}
				</View>

				{/* Подзадачи */}
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
				</View>
			</View>
		</ScrollBox>
	)
}
