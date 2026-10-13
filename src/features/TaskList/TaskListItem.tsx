import { useRouter } from 'expo-router'
import { Alert, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { useDeleteTask, useDeleteTaskPermanently } from '@/features/TaskList'
import { TaskEntity } from '@/shared/domain/task'
import { useContextMenuStore } from '@/shared/model/contextMenu.store'
import { useTaskStore } from '@/shared/model/task.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { triggerHapticLight } from '@/shared/ui/Haptic'
import { formatScheduleLabel } from '../Schedule/model/scheduleLabel'

type TaskListItemProps = {
	data: TaskEntity
	onSchedulePress?: (task: TaskEntity) => void
}

export default function TaskListItem({
	data,
	onSchedulePress
}: TaskListItemProps) {
	const router = useRouter()
	const { theme } = useUnistyles()

	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipeRoute = useNavStore((store) => store.setSwipeRoute)
	const openContextMenu = useContextMenuStore((store) => store.openContextMenu)
	const deleteTaskPermanentlyMutation = useDeleteTaskPermanently()
	const deleteTaskMutation = useDeleteTask()

	const isDeleted = data.lifecycle === 'd'

	const handlePress = () => {
		setSelectedTaskId(data.id)
		setSwipeRoute('task')
		router.push('/task')
	}

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

	const handleOpenContextMenu = (positionX: number, positionY: number) => {
		triggerHapticLight()

		if (isDeleted) {
			const menuItems = [
				{
					title: 'Удалить навсегда',
					onPress: handleDeletePermanently,
					destructive: true
				}
			]

			openContextMenu({ x: positionX, y: positionY }, menuItems)
			return
		}

		const menuItems = [
			{
				title: 'Расписание',
				onPress: () => {
					onSchedulePress?.(data)
				}
			},
			{
				title: 'Удалить',
				onPress: () => {
					deleteTaskMutation.mutate(data.id)
				},
				destructive: true
			}
		]

		openContextMenu({ x: positionX, y: positionY }, menuItems)
	}

	const tapGesture = Gesture.Tap().onEnd(() => {
		scheduleOnRN(handlePress)
	})

	const longPressGesture = Gesture.LongPress()
		.minDuration(500)
		.onStart((event) => {
			'worklet'
			scheduleOnRN(handleOpenContextMenu, event.absoluteX, event.absoluteY)
		})

	const composedGesture = Gesture.Race(longPressGesture, tapGesture)

	return (
		<Animated.View
			layout={LinearTransition.duration(250)}
			exiting={FadeOut.duration(200)}
		>
			<GestureDetector gesture={composedGesture}>
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
					{data.schedule && (
						<Text
							style={{
								fontSize: 12,
								color: theme.colors.mutedTextStrong,
								marginTop: 4
							}}
						>
							{formatScheduleLabel(data.schedule.schedule)}
						</Text>
					)}
				</View>
			</GestureDetector>
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
