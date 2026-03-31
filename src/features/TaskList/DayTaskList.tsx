import { Text } from 'react-native'

import TaskItem from '@/features/TaskList/TaskItem'
import { textStyles } from '@/shared/styles/text'
import CircleProgress from '@/shared/ui/CircleProgress'

export default function DayTaskList() {
	return (
		<>
			<Text style={textStyles.heading5}>During the day</Text>

			<TaskItem>
				<CircleProgress title='Прогресс 1' />
			</TaskItem>

			<TaskItem />

			<TaskItem />

			<Text style={textStyles.heading5}>By time</Text>

			<TaskItem />
			<TaskItem />
			<TaskItem />

			<TaskItem />
			<TaskItem />
			<TaskItem />
		</>
	)
}
