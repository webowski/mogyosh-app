import { useRouter } from 'expo-router'
import { PropsWithChildren } from 'react'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { useTaskProgress } from '@/features/TaskList'
import { useCategoriesStore } from '@/features/TaskList/model/categoriesStore'
import {
	isByTime,
	makeCategoryPath
} from '@/features/TaskList/model/task.utils'
import { useSettingsStore } from '@/services/settings/model/settingsStore'
import type { TaskEntity } from '@/shared/domain/task'
import { formatTime } from '@/shared/lib/time'
import { useTaskStore } from '@/shared/model/taskStore'
import { STYLE_VARS } from '@/shared/styles/common'
import CircleProgress from '@/shared/ui/CircleProgress'
import { scheduleOnRN } from 'react-native-worklets'

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
	const router = useRouter()
	const categoryMap = useCategoriesStore((store) => store.entities)
	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipeRoute = useNavStore((store) => store.setSwipeRoute)
	const hourFormat = useSettingsStore((store) => store.hourFormat)
	const { data: progressData } = useTaskProgress(data.id)
	// const deleteTaskMutation = useDeleteTask()

	const isByTimeBool = isByTime(data)

	// Shared values for swipe animation
	const translateX = useSharedValue(0)
	const itemHeight = useSharedValue(0)
	const deleteOpacity = useSharedValue(0)
	const completeOpacity = useSharedValue(0)

	// const deleteTask = () => {
	// 	deleteTaskMutation.mutate(data.id)
	// 	onDelete?.(data.id)
	// }

	// const completeTask = () => {
	// 	onComplete?.(data.id)
	// }

	const panGesture = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.onUpdate((event) => {
			// translateX.value = event.translationX
			// if (event.translationX < 0) {
			// 	// Swipe left — delete zone
			// 	deleteOpacity.value = Math.min(
			// 		1,
			// 		Math.abs(event.translationX) / Math.abs(DELETE_THRESHOLD)
			// 	)
			// 	completeOpacity.value = 0
			// } else {
			// 	// Swipe right — complete zone
			// 	completeOpacity.value = Math.min(
			// 		1,
			// 		event.translationX / COMPLETE_THRESHOLD
			// 	)
			// 	deleteOpacity.value = 0
			// }
		})
		.onEnd((event) => {
			// if (event.translationX < DELETE_THRESHOLD) {
			// 	translateX.value = withTiming(-500, { duration: 300 })
			// 	itemHeight.value = withTiming(0, { duration: 300 })
			// 	scheduleOnRN(deleteTask)
			// } else if (event.translationX > COMPLETE_THRESHOLD) {
			// 	translateX.value = withTiming(500, { duration: 300 })
			// 	itemHeight.value = withTiming(0, { duration: 300 })
			// 	scheduleOnRN(completeTask)
			// } else {
			// 	// Snap back
			// 	translateX.value = withTiming(0, { duration: 250 })
			// 	deleteOpacity.value = withTiming(0, { duration: 250 })
			// 	completeOpacity.value = withTiming(0, { duration: 250 })
			// }
		})

	const goTaskScreen = () => {
		setSelectedTaskId(data.id)
		setSwipeRoute('task')
		router.push('/task')
	}

	const tapGesture = Gesture.Tap().onEnd(() => {
		scheduleOnRN(goTaskScreen)
	})

	// Combine tap and pan — pan has priority and blocks tap
	const composedGesture = Gesture.Exclusive(panGesture, tapGesture)

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }]
	}))

	const deleteContainerStyle = useAnimatedStyle(() => ({
		opacity: deleteOpacity.value
	}))

	const completeContainerStyle = useAnimatedStyle(() => ({
		opacity: completeOpacity.value
	}))

	const progress = progressData?.progress ?? 0
	const totalProgressCount = progressData?.totalCount ?? 0
	const completedProgressCount = progressData?.completedCount ?? 0

	return (
		<View style={styles.wrapper}>
			{/* Complete background */}
			<Animated.View
				style={[styles.completeBackground, completeContainerStyle]}
			>
				<Text style={styles.completeBackground__label}>Done</Text>
			</Animated.View>

			{/* Delete background */}
			<Animated.View style={[styles.deleteBackground, deleteContainerStyle]}>
				<Text style={styles.deleteBackground__label}>Delete</Text>
			</Animated.View>

			<GestureDetector gesture={composedGesture}>
				<Animated.View
					style={[styles.card, cardAnimatedStyle]}
					onLayout={(e) => {
						itemHeight.value = e.nativeEvent.layout.height
					}}
				>
					{isByTimeBool && (
						<Text style={styles.card__time}>
							{formatTime(
								data.schedules?.[0]?.start_time as string,
								hourFormat
							)}
						</Text>
					)}
					<View style={styles.card__columns}>
						<View style={styles.card__header}>
							{data.category && (
								<Text style={styles.card__category}>
									{makeCategoryPath(data.category.id, categoryMap)}
								</Text>
							)}
							<Text style={styles.card__title}>{data.info}</Text>
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
		borderRadius: STYLE_VARS.radius_sm
	},

	completeBackground__label: {
		color: theme.colors.inverse,
		fontSize: 12 * rt.fontScale,
		fontWeight: 600
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
		borderRadius: STYLE_VARS.radius_sm
	},

	deleteBackground__label: {
		color: theme.colors.inverse,
		fontSize: 12 * rt.fontScale,
		fontWeight: 600
	},

	card: {
		paddingHorizontal: 13,
		paddingVertical: 13,
		backgroundColor: theme.colors.surface,
		boxShadow: theme.colors.shadeCard,
		borderRadius: STYLE_VARS.radius_sm,
		gap: 8
	},

	card__header: {
		maxWidth: '100%'
	},

	card__columns: {
		flexDirection: 'row',
		gap: 12,
		justifyContent: 'space-between'
	},
	card__category: {
		color: theme.colors.mutedTextDark,
		fontSize: 13 * rt.fontScale,
		lineHeight: 13 * rt.fontScale * 1.2
		// letterSpacing: (14 / 100) * -1
	},
	card__title: {
		color: theme.colors.major,
		fontSize: 15 * rt.fontScale,
		fontWeight: 600
		// letterSpacing: (16 / 100) * -1
	},
	card__time: {
		fontSize: 12 * rt.fontScale,
		fontWeight: 600,
		position: 'absolute',
		top: 0,
		right: 0,
		color: theme.colors.mutedTextDark,
		backgroundColor: theme.colors.mutedLightestText,
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
