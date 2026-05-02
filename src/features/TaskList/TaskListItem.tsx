import { useRouter } from 'expo-router'
import { Pressable, Text } from 'react-native'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { TaskEntity } from '@/shared/domain/task'
import { useTaskStore } from '@/shared/model/taskStore'
import { styleVars } from '@/shared/styles/common'
import { StyleSheet } from 'react-native-unistyles'

type TaskListItemProps = {
	data: TaskEntity
}

export default function TaskListItem({ data }: TaskListItemProps) {
	const router = useRouter()

	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipePosition = useNavStore((store) => store.setSwipePosition)

	const handlePress = () => {
		setSelectedTaskId(data.id)
		setSwipePosition({ row: 0, col: 2 })
		router.push('/task')
	}

	return (
		<Pressable onPress={handlePress} style={styles.taskListItem}>
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

const styles = StyleSheet.create((theme, rt) => ({
	taskListItem: {
		padding: 12,
		marginVertical: 4,
		backgroundColor: '#ffffff',
		borderRadius: styleVars.radius,
		boxShadow: '0px 2px 4px rgba(102, 140, 255, 0.08)'
	}
}))
