import { View } from 'react-native'

import Calendar from '@/features/Calendar/Calendar'
import { commonStyles } from '@/shared/styles/common'

export default function CalendarScreen() {
	return (
		<View style={commonStyles.mainArea}>
			<Calendar />
		</View>
	)

	/**
	 * Использует хук useTasksCountByPeriod для получения счётчиков задач
	 */
	// const [currentMonth, setCurrentMonth] = useState(new Date())

	// const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
	// const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

	// const { data, isLoading, error } = useTasksCountByPeriod(startDate, endDate)

	// const goToPreviousMonth = () => {
	// 	setCurrentMonth((prev) => addMonths(prev, -1))
	// }

	// const goToNextMonth = () => {
	// 	setCurrentMonth((prev) => addMonths(prev, 1))
	// }

	// const goToToday = () => {
	// 	setCurrentMonth(new Date())
	// }

	// if (isLoading) return <Text>Загрузка...</Text>
	// if (error) return <Text>Ошибка загрузки</Text>

	// // Создаём массив дней текущего месяца
	// const daysInMonth = eachDayOfInterval({
	// 	start: startOfMonth(currentMonth),
	// 	end: endOfMonth(currentMonth)
	// })

	// // Создаём мапу для быстрого доступа к количеству задач по дате
	// const tasksCountMap = new Map(
	// 	data?.days.map((day) => [day.date, day.count]) || []
	// )

	// return (
	// 	<ScrollBox>
	// 		<View>
	// 			{/* Навигация по месяцам */}
	// 			<View
	// 				style={{
	// 					flexDirection: 'row',
	// 					justifyContent: 'space-between',
	// 					alignItems: 'center',
	// 					padding: 16
	// 				}}
	// 			>
	// 				<Text onPress={goToPreviousMonth} style={{ fontSize: 24 }}>
	// 					←
	// 				</Text>
	// 				<Text style={{ fontSize: 18, fontWeight: 'bold' }}>
	// 					{format(currentMonth, 'MMMM yyyy')}
	// 				</Text>
	// 				<Text onPress={goToNextMonth} style={{ fontSize: 24 }}>
	// 					→
	// 				</Text>
	// 			</View>

	// 			<View style={{ paddingVertical: 8 }}>
	// 				<Text
	// 					onPress={goToToday}
	// 					style={{ textAlign: 'center', color: '#007AFF' }}
	// 				>
	// 					Сегодня
	// 				</Text>
	// 			</View>

	// 			{/* Сетка календаря */}
	// 			<View style={{ padding: 16 }}>
	// 				{/* Дни недели */}
	// 				<View style={{ flexDirection: 'row', marginBottom: 8 }}>
	// 					{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
	// 						<View key={day} style={{ flex: 1, alignItems: 'center' }}>
	// 							<Text style={{ fontWeight: 'bold' }}>{day}</Text>
	// 						</View>
	// 					))}
	// 				</View>

	// 				{/* Дни месяца */}
	// 				<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
	// 					{daysInMonth.map((day) => {
	// 						const dateStr = format(day, 'yyyy-MM-dd')
	// 						const count = tasksCountMap.get(dateStr) || 0
	// 						const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

	// 						return (
	// 							<View
	// 								key={dateStr}
	// 								style={{
	// 									width: '14.28%',
	// 									aspectRatio: 1,
	// 									alignItems: 'center',
	// 									justifyContent: 'center',
	// 									borderRadius: 8,
	// 									backgroundColor: isToday ? '#007AFF' : 'transparent'
	// 								}}
	// 							>
	// 								<Text style={{ color: isToday ? '#fff' : '#000' }}>
	// 									{format(day, 'd')}
	// 								</Text>
	// 								{count > 0 && (
	// 									<View
	// 										style={{
	// 											position: 'absolute',
	// 											bottom: 4,
	// 											backgroundColor: isToday ? '#fff' : '#007AFF',
	// 											borderRadius: 10,
	// 											paddingHorizontal: 6,
	// 											paddingVertical: 2
	// 										}}
	// 									>
	// 										<Text
	// 											style={{
	// 												fontSize: 10,
	// 												color: isToday ? '#007AFF' : '#fff'
	// 											}}
	// 										>
	// 											{String(count)}
	// 										</Text>
	// 									</View>
	// 								)}
	// 							</View>
	// 						)
	// 					})}
	// 				</View>
	// 			</View>
	// 		</View>
	// 	</ScrollBox>
	// )
}
