import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

import { useTaskById, useTaskSubtasks } from '@/features/TaskList/model'
import TaskListItem from '@/features/TaskList/TaskListItem'
import ScrollBox from '@/shared/ui/ScrollBox'

/**
 * Экран "Задача" с отображением подзадач
 *
 * Использует хуки:
 * - useTaskById для получения основной задачи
 * - useTaskSubtasks для получения списка подзадач
 */
export default function TaskDetailScreenExample() {
	const { taskId } = useLocalSearchParams<{ taskId: string }>()

	const { data: task, isLoading: isLoadingTask } = useTaskById(taskId || null)
	const { data: subtasks, isLoading: isLoadingSubtasks } = useTaskSubtasks(
		taskId || null
	)

	if (isLoadingTask) return <ActivityIndicator />
	if (!task) return <Text>Задача не найдена</Text>

	return (
		<ScrollBox>
			<View>
				{/* Информация о задаче */}
				<View>
					<Text>{task.info}</Text>
					{task.category && <Text>{task.category.name}</Text>}
					{task.priority && <Text>Приоритет: {task.priority}</Text>}
					{task.status && <Text>Статус: {task.status}</Text>}
				</View>

				{/* Подзадачи */}
				<View>
					<Text>Подзадачи</Text>
					{isLoadingSubtasks ? (
						<ActivityIndicator />
					) : subtasks && subtasks.length > 0 ? (
						<FlatList
							data={subtasks}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => <TaskListItem data={item} />}
						/>
					) : (
						<Text>Нет подзадач</Text>
					)}
				</View>
			</View>
		</ScrollBox>
	)
}
