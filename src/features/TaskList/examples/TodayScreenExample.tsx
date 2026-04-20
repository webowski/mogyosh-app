import { addDays, format } from 'date-fns'
import { useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

import { useTasksByDate } from '@/features/TaskList/model/useTasks'
import TaskListItem from '@/features/TaskList/TaskListItem'
import ScrollBox from '@/shared/ui/ScrollBox'

/**
 * Экран "Сегодня" с возможностью переключения на любой день
 *
 * Использует хук useTasksByDate для получения задач на выбранную дату
 */
export default function TodayScreen() {
	const [selectedDate, setSelectedDate] = useState(new Date())
	const dateStr = format(selectedDate, 'yyyy-MM-dd')

	const { data, isLoading, error } = useTasksByDate(dateStr)

	const goToPreviousDay = () => {
		setSelectedDate((prev) => addDays(prev, -1))
	}

	const goToNextDay = () => {
		setSelectedDate((prev) => addDays(prev, 1))
	}

	const goToToday = () => {
		setSelectedDate(new Date())
	}

	if (isLoading) return <ActivityIndicator />
	if (error) return <Text>Ошибка загрузки</Text>

	return (
		<ScrollBox>
			<View>
				{/* Дата навигация */}
				<View>
					<Text onPress={goToPreviousDay}>←</Text>
					<Text>{format(selectedDate, 'dd MMMM yyyy')}</Text>
					<Text onPress={goToNextDay}>→</Text>
					<Text onPress={goToToday}>Сегодня</Text>
				</View>

				{/* Список задач */}
				{data && data.length > 0 ? (
					<FlatList
						data={data}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <TaskListItem data={item} />}
					/>
				) : (
					<Text>Нет задач на этот день</Text>
				)}
			</View>
		</ScrollBox>
	)
}
