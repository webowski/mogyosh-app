import { Text, View } from 'react-native'

import { TaskEntity } from '@/shared/domain/task'

type TaskListItemProps = {
	data: TaskEntity
}

export default function TaskListItem({ data }: TaskListItemProps) {
	return (
		<View>
			<Text>{data.info}</Text>
		</View>
	)
}
