import { MenuView } from '@expo/ui/community/menu'
import { useRouter } from 'expo-router'
import { Alert, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { useDeleteTask, useDeleteTaskPermanently } from '@/features/TaskList'
import { TaskEntity } from '@/shared/domain/task'
import { useTaskStore } from '@/shared/model/task.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

type TaskListItemProps = {
	data: TaskEntity
}

export default function TaskListItem({ data }: TaskListItemProps) {
	const router = useRouter()
	const { theme } = useUnistyles()

	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipeRoute = useNavStore((store) => store.setSwipeRoute)
	const deleteTaskPermanentlyMutation = useDeleteTaskPermanently()
	const deleteTaskMutation = useDeleteTask()

	const isDeleted = data.lifecycle === 'deleted'

	const handlePress = () => {
		setSelectedTaskId(data.id)
		setSwipeRoute('task')
		router.push('/task')
	}

	const tapGesture = Gesture.Tap().onEnd(() => {
		scheduleOnRN(handlePress)
	})

	const handleDeletePermanently = () => {
		Alert.alert(
			'Удалить навсегда?',
			`Задача «${data.title}» будет удалена без возможности восстановления.`,
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить навсегда',
					style: 'destructive',
					onPress: () => {
						deleteTaskPermanentlyMutation.mutate(data.id)
					}
				}
			]
		)
	}

	const handleMenuPressAction = (event: { nativeEvent: { event: string } }) => {
		if (event.nativeEvent.event === 'deletePermanently') {
			handleDeletePermanently()
		}

		if (event.nativeEvent.event === 'delete') {
			deleteTaskMutation.mutate(data.id)
		}
	}

	const content = (
		<GestureDetector gesture={tapGesture}>
			<View style={styles.taskListItem}>
				<Text
					style={{
						fontSize: 15,
						fontWeight: '500',
						color: theme.colors.major
					}}
				>
					{data.title}
				</Text>
				{data.priority !== null && data.priority !== undefined && (
					<Text
						style={{
							fontSize: 12,
							color: theme.colors.mutedTextStrong,
							marginTop: 4
						}}
					>
						Priority: {data.priority}
					</Text>
				)}
			</View>
		</GestureDetector>
	)

	if (!isDeleted) {
		return (
			<Animated.View
				layout={LinearTransition.duration(250)}
				exiting={FadeOut.duration(200)}
			>
				<MenuView
					shouldOpenOnLongPress
					actions={[
						{
							id: 'delete',
							title: 'Удалить',
							image: undefined,
							attributes: { destructive: true }
						}
					]}
					onPressAction={handleMenuPressAction}
				>
					{content}
				</MenuView>
			</Animated.View>
		)
	}

	return (
		<Animated.View
			layout={LinearTransition.duration(250)}
			exiting={FadeOut.duration(200)}
		>
			<MenuView
				shouldOpenOnLongPress
				actions={[
					{
						id: 'deletePermanently',
						title: 'Удалить навсегда',
						image: undefined,
						attributes: { destructive: true }
					},
					{
						id: 'restore',
						title: 'Восстановить',
						image: undefined,
						attributes: { destructive: false }
					}
				]}
				onPressAction={handleMenuPressAction}
			>
				{content}
			</MenuView>
		</Animated.View>
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
