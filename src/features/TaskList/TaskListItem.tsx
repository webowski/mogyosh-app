import { useRouter } from 'expo-router'
import { Pressable, Text } from 'react-native'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { TaskEntity } from '@/shared/domain/task'
import { useTaskStore } from '@/shared/model/taskStore'
import { STYLE_VARS } from '@/shared/styles/common'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type TaskListItemProps = {
	data: TaskEntity
}

export default function TaskListItem({ data }: TaskListItemProps) {
	const router = useRouter()
	const { theme } = useUnistyles()

	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipeRoute = useNavStore((store) => store.setSwipeRoute)

	const handlePress = () => {
		setSelectedTaskId(data.id)
		setSwipeRoute('task')
		router.push('/task')
	}

	return (
		<Pressable onPress={handlePress} style={styles.taskListItem}>
			<Text
				style={{ fontSize: 14, fontWeight: '500', color: theme.colors.major }}
			>
				{data.info}
			</Text>
			{data.priority !== null && data.priority !== undefined && (
				<Text
					style={{
						fontSize: 12,
						color: theme.colors.mutedTextDark,
						marginTop: 4
					}}
				>
					Priority: {data.priority}
				</Text>
			)}
			{data.state && (
				<Text
					style={{
						fontSize: 12,
						color: theme.colors.mutedTextDark,
						marginTop: 2
					}}
				>
					State: {data.state}
				</Text>
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	taskListItem: {
		padding: 12,
		backgroundColor: theme.colors.surface,
		borderRadius: STYLE_VARS.radius_md,
		boxShadow: theme.colors.shadeCard
	}
}))
