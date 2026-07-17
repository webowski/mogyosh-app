import { MenuView } from '@expo/ui/community/menu'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useRouter } from 'expo-router'
import { PropsWithChildren } from 'react'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	FadeOut,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { scheduleOnRN } from 'react-native-worklets'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { useCategoriesStore } from '@/features/TaskList/model/categoriesStore'
import {
	isByTime,
	makeCategoryPath
} from '@/features/TaskList/model/task.utils'
import { useSettingsStore } from '@/services/settings/model/settingsStore'
import type { TaskEntity } from '@/shared/domain/task'
import { formatTime } from '@/shared/lib/time'
import { useTaskStore } from '@/shared/model/task.store'
import { STYLE_VARS } from '@/shared/styles/common'
import CircleProgress from '@/shared/ui/CircleProgress'
import { triggerHapticLight } from '@/shared/ui/Haptic'
import { useTaskListViewStore } from './model/taskListView.store'
import { useDeleteTask } from './model/useDeleteTask'
import { useTaskProgress } from './model/useTaskProgress'
import { useUpdateTaskState } from './model/useUpdateTaskState'

const DELETE_THRESHOLD = -80
const DELETE_ZONE_WIDTH = 72

const COMPLETE_THRESHOLD = 80
const COMPLETE_ZONE_WIDTH = 72

type TaskItemProps = {
	data: TaskEntity
	onDelete?: (id: string) => void
	onComplete?: (id: string) => void
} & PropsWithChildren

export default function TaskItem({
	data,
	children,
	onDelete,
	onComplete
}: TaskItemProps) {
	const { theme } = useUnistyles()
	const router = useRouter()
	const categoryMap = useCategoriesStore((store) => store.entities)
	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipeRoute = useNavStore((store) => store.setSwipeRoute)
	const hourFormat = useSettingsStore((store) => store.hourFormat)
	const isSortMode = useTaskListViewStore((store) => store.isSortMode)
	const { data: progressData } = useTaskProgress(data.id)
	const deleteTaskMutation = useDeleteTask()
	const updateTaskStateMutation = useUpdateTaskState()

	const isByTimeBool = isByTime(data)
	const isCompleted = data.state === 'done'

	// Shared values for swipe animation
	const translateX = useSharedValue(0)
	const itemHeight = useSharedValue(0)
	const deleteOpacity = useSharedValue(0)
	const completeOpacity = useSharedValue(0)

	const deleteTask = () => {
		deleteTaskMutation.mutate(data.id)
		onDelete?.(data.id)
	}

	const toggleCompleteTask = () => {
		const newState = isCompleted ? 'active' : 'done'
		updateTaskStateMutation.mutate({ taskId: data.id, state: newState })
		onComplete?.(data.id)
	}

	const panGesture = Gesture.Pan()
		.enabled(!isSortMode)
		.activeOffsetX([-10, 10])
		.onUpdate((event) => {
			if (event.translationX < 0) {
				// // Swipe left — delete zone
				// translateX.value = event.translationX
				// deleteOpacity.value = Math.min(
				// 	1,
				// 	Math.abs(event.translationX) / Math.abs(DELETE_THRESHOLD)
				// )
				// completeOpacity.value = 0
			} else {
				// Swipe right — complete zone
				translateX.value = event.translationX
				deleteOpacity.value = 0
				completeOpacity.value = Math.min(
					1,
					event.translationX / COMPLETE_THRESHOLD
				)
			}
		})
		.onEnd((event) => {
			if (event.translationX < DELETE_THRESHOLD) {
				// translateX.value = withTiming(-500, { duration: 300 })
				// // itemHeight.value = withTiming(0, { duration: 300 })
				// scheduleOnRN(deleteTask)
			} else if (event.translationX > COMPLETE_THRESHOLD) {
				translateX.value = withTiming(0, { duration: 300 })
				scheduleOnRN(toggleCompleteTask)
			} else {
				translateX.value = withTiming(0, { duration: 250 })
				deleteOpacity.value = withTiming(0, { duration: 250 })
				completeOpacity.value = withTiming(0, { duration: 250 })
			}
		})

	const goTaskScreen = () => {
		setSelectedTaskId(data.id)
		setSwipeRoute('task')
		router.push('/task')
	}

	const tapGesture = Gesture.Tap()
		.enabled(!isSortMode)
		.onEnd(() => {
			scheduleOnRN(goTaskScreen)
		})

	// Combine tap and pan — pan has priority and blocks tap
	// Disabled entirely while sort mode is active: dragging is handled
	// externally by TaskDragSort's own gesture, not by this component
	const composedGesture = Gesture.Exclusive(panGesture, tapGesture)

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }]
	}))

	const deleteContainerStyle = useAnimatedStyle(() => ({
		opacity: deleteOpacity.value
	}))

	const completeContainerStyle = useAnimatedStyle(() => ({
		opacity: isCompleted ? 1 : completeOpacity.value
	}))

	// const cardBackgroundColorStyle = useAnimatedStyle(() => {
	// 	const bgColor = isCompleted
	// 		? theme.colors.surfaceSubtle
	// 		: theme.colors.surface
	// 	return {
	// 		backgroundColor: bgColor
	// 	}
	// })

	const progress = progressData?.progress ?? 0
	const totalProgressCount = progressData?.totalCount ?? 0
	const completedProgressCount = progressData?.completedCount ?? 0

	// 	const deleteIcon = Icon.select({
	// 	ios: 'trash',
	// 	android: import('@expo/material-symbols/delete.xml')
	// })

	const handleMenuPressAction = (event: { nativeEvent: { event: string } }) => {
		if (event.nativeEvent.event === 'delete') {
			deleteTask()
		}
	}

	const handleOpenMenu = () => {
		triggerHapticLight()
	}

	return (
		<Animated.View
			layout={LinearTransition.duration(250)}
			exiting={FadeOut.duration(200)}
		>
			<MenuView
				onOpenMenu={handleOpenMenu}
				shouldOpenOnLongPress={!isSortMode}
				actions={[
					{
						id: 'delete',
						title: 'Delete task',
						image: undefined,
						attributes: { destructive: true }
					}
				]}
				onPressAction={handleMenuPressAction}
			>
				<View style={styles.wrapper}>
					{/* Complete background */}
					<Animated.View
						style={[styles.completeBackground, completeContainerStyle]}
					>
						<Text style={styles.completeBackground__label}>Done</Text>
					</Animated.View>

					{/* Delete background */}
					<Animated.View
						style={[styles.deleteBackground, deleteContainerStyle]}
					>
						<Text style={styles.deleteBackground__label}>Delete</Text>
					</Animated.View>

					<GestureDetector gesture={composedGesture}>
						<Animated.View
							style={[
								styles.card,
								cardAnimatedStyle
								// cardBackgroundColorStyle,
								// isCompleted && styles.card_completed
							]}
							// onLayout={(e) => {
							// 	itemHeight.value = e.nativeEvent.layout.height
							// }}
						>
							{isCompleted && (
								<Animated.View
									style={[
										styles.card__completedBackground,
										completeContainerStyle
									]}
								/>
							)}

							{isByTimeBool && (
								<Text style={styles.card__time}>
									{formatTime(
										data.schedules?.[0]?.start_time as string,
										hourFormat
									)}
								</Text>
							)}

							{isSortMode && (
								<View style={{ position: 'absolute', left: -8 }}>
									<MaterialDesignIcons
										name='drag-vertical'
										size={28}
										style={{ flex: 0 }}
									/>
								</View>
							)}

							<View style={styles.card__columns}>
								<View style={styles.card__header}>
									{data.category && (
										<Text style={styles.card__category}>
											{makeCategoryPath(data.category.id, categoryMap)}
										</Text>
									)}
									<Text style={styles.card__title}>{data.title}</Text>
								</View>
								<View></View>
							</View>
							{children}
							{totalProgressCount > 0 && (
								<View style={styles.card__dashboard}>
									<CircleProgress
										progress={progress}
										value={`${completedProgressCount}/${totalProgressCount}`}
									/>
								</View>
							)}
						</Animated.View>
					</GestureDetector>
				</View>
			</MenuView>
		</Animated.View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	wrapper: {
		position: 'relative',
		// overflow: 'hidden',
		borderRadius: STYLE_VARS.radius_sm
	},

	completeBackground: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: COMPLETE_ZONE_WIDTH,
		backgroundColor: theme.colors.success,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: STYLE_VARS.radius_sm,
		opacity: 0
	},

	completeBackground__label: {
		color: theme.colors.inverse,
		fontSize: 12 * rt.fontScale,
		fontWeight: '600' as const
	},

	deleteBackground: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,
		width: DELETE_ZONE_WIDTH,
		backgroundColor: theme.colors.danger,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: STYLE_VARS.radius_sm,
		opacity: 0
	},

	deleteBackground__label: {
		color: theme.colors.inverse,
		fontSize: 12 * rt.fontScale,
		fontWeight: '600' as const
	},

	card: {
		paddingHorizontal: 13,
		paddingVertical: 13,
		backgroundColor: theme.colors.surface,
		boxShadow: theme.colors.shadeCard,
		borderRadius: STYLE_VARS.radius_sm,
		gap: 8
	},

	card_completed: {
		// backgroundColor: theme.colors.surfaceSubtle
	},

	card__completedBackground: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 3,
		backgroundColor: theme.colors.success,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_sm
	},

	card__header: {
		maxWidth: '100%'
	},

	card__columns: {
		flexDirection: 'row',
		gap: 12,
		// justifyContent: 'space-between'
		justifyContent: 'flex-start'
	},
	card__category: {
		color: theme.colors.mutedTextStrong,
		fontSize: 13 * rt.fontScale,
		lineHeight: 13 * rt.fontScale * 1.2
		// letterSpacing: (14 / 100) * -1
	},
	card__title: {
		color: theme.colors.major,
		fontSize: 15 * rt.fontScale,
		fontWeight: '600' as const
		// letterSpacing: (16 / 100) * -1
	},
	card__time: {
		fontSize: 12 * rt.fontScale,
		fontWeight: '600' as const,
		position: 'absolute',
		top: 0,
		right: 0,
		color: theme.colors.mutedTextStrong,
		backgroundColor: theme.colors.mutedSubtlestText,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_sm,
		paddingVertical: 3,
		paddingRight: 12,
		paddingLeft: 10
	},

	card__dashboard: {
		flexDirection: 'row',
		gap: 12
	}
}))
