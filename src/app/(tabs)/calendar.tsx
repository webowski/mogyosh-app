// import Calendar from '@/features/Calendar/Calendar'
// import { Calendar } from '@marceloterreiro/flash-calendar'
import { subMonths } from 'date-fns'
import { Text } from 'react-native'

export default function CalendarScreen() {
	// const today = new Date().toISOString().split('T')[0]
	const threeMonthsAgo = subMonths(new Date(), 3)

	return (
		<>
			<Text>Колендырь</Text>
			{/* <Calendar.List
				// calendarMonthId={toDateId(threeMonthsAgo)}
				getCalendarDayFormat={format('d')}
				getCalendarMonthFormat={format('MMMM yyyy (LL/yyyy)')}
				getCalendarWeekDayFormat={format('E')}
				onCalendarDayPress={(dateId) => {
					console.log(`Clicked on ${dateId}`)
				}}
			/> */}
		</>
	)
}
