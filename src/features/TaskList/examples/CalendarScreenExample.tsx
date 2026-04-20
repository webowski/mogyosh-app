import { useState } from 'react'
import { Text, View } from 'react-native'
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

import { useTasksCountByPeriod } from '@/features/TaskList/model/useTasks'
import ScrollBox from '@/shared/ui/ScrollBox'

/**
 * Экран "Календарь" с отображением количества задач в каждом дне
 * 
 * Использует хук useTasksCountByPeriod для получения счётчиков задач по дням
 */
export default function CalendarScreenExample() {
	const [currentMonth, setCurrentMonth] = useState(new Date())
	
	const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
	const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
	
	const { data, isLoading, error } = useTasksCountByPeriod(startDate, endDate)

	const goToPreviousMonth = () => {
		setCurrentMonth((prev) => addMonths(prev, -1))
	}

	const goToNextMonth = () => {
		setCurrentMonth((prev) => addMonths(prev, 1))
	}

	const goToToday = () => {
		setCurrentMonth(new Date())
	}

	if (isLoading) return <Text>Загрузка...</Text>
	if (error) return <Text>Ошибка загрузки</Text>

	// Создаём массив дней текущего месяца
	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endOfMonth(currentMonth)
	})

	// Создаём мапу для быстрого доступа к количеству задач по дате
	const tasksCountMap = new Map(
		data?.days.map((day) => [day.date, day.count]) || []
	)

	return (
		<ScrollBox>
			<View>
				{/* Навигация по месяцам */}
				<View>
					<Text onPress={goToPreviousMonth}>←</Text>
					<Text>{format(currentMonth, 'MMMM yyyy')}</Text>
					<Text onPress={goToNextMonth}>→</Text>
					<Text onPress={goToToday}>Сегодня</Text>
				</View>

				{/* Сетка календаря */}
				<View>
					{/* Дни недели */}
					<View>
						{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
							<Text key={day}>{day}</Text>
						))}
					</View>

					{/* Дни месяца */}
					<View>
						{daysInMonth.map((day) => {
							const dateStr = format(day, 'yyyy-MM-dd')
							const count = tasksCountMap.get(dateStr) || 0
							
							return (
								<View key={dateStr}>
									<Text>{format(day, 'd')}</Text>
									{count > 0 && <Text>{count}</Text>}
								</View>
							)
						})}
					</View>
				</View>
			</View>
		</ScrollBox>
	)
}
