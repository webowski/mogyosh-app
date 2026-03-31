import { TaskEntity } from '@/shared/domain/task'
import { Text, View } from 'react-native'

type TaskListItemProps = {
	data: TaskEntity
}

export default function TaskListItem({ data }: TaskListItemProps) {
	return (
		<View>
			<Text>{data.title}</Text>
		</View>
	)
}
