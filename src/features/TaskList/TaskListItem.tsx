import { Pressable, Text } from 'react-native'

import { TaskEntity } from '@/shared/domain/task'

type TaskListItemProps = {
	data: TaskEntity
}

export default function TaskListItem({ data }: TaskListItemProps) {
	return (
		<Pressable
			style={{
				padding: 12,
				marginHorizontal: 16,
				marginVertical: 4,
				backgroundColor: '#ffffff',
				borderRadius: 8,
				borderWidth: 1,
				borderColor: '#e0e0e0'
			}}
		>
			<Text style={{ fontSize: 14, fontWeight: '500' }}>{data.info}</Text>
			{data.priority !== null && data.priority !== undefined && (
				<Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
					Priority: {data.priority}
				</Text>
			)}
			{data.state && (
				<Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
					State: {data.state}
				</Text>
			)}
		</Pressable>
	)
}
