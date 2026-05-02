import { useRouter } from 'expo-router'
import { PropsWithChildren } from 'react'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useNavStore } from '@/features/Navigation/model/navStore'
import { useTaskProgress } from '@/features/TaskList/model'
import { useCategoriesStore } from '@/features/TaskList/model/categoriesStore'
import {
	isByTime,
	makeCategoryPath
} from '@/features/TaskList/model/task.utils'
import { useSettingsStore } from '@/services/settings/model/settingsStore'
import { TaskEntity } from '@/shared/domain/task'
import { formatTime } from '@/shared/lib/time'
import { useTaskStore } from '@/shared/model/taskStore'
import { styleVars } from '@/shared/styles/common'
import CircleProgress from '@/shared/ui/CircleProgress'

type TaskItemProps = {
	data: TaskEntity
} & PropsWithChildren

export default function TaskItem({ data, children }: TaskItemProps) {
	const router = useRouter()
	const categoryMap = useCategoriesStore((store) => store.entities)
	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipePosition = useNavStore((store) => store.setSwipePosition)
	const hourFormat = useSettingsStore((store) => store.hourFormat)
	const { data: progressData } = useTaskProgress(data.id)

	const isByTimeBool = isByTime(data)

	const handlePress = () => {
		setSelectedTaskId(data.id)
		setSwipePosition({ row: 0, col: 2 })
		router.push('/task')
	}

	const progress = progressData?.progress ?? 0
	const totalProgressCount = progressData?.totalCount ?? 0
	const completedProgressCount = progressData?.completedCount ?? 0

	return (
		<Pressable style={styles.card} onPress={handlePress}>
			{isByTimeBool && (
				<Text style={styles.card__time}>
					{formatTime(data.schedules?.[0]?.start_time as string, hourFormat)}
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
		</Pressable>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	card: {
		padding: 14,
		backgroundColor: theme.colors.surface,
		boxShadow: '0px 2px 4px rgba(102, 140, 255, 0.08)',
		borderRadius: styleVars.radius,
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
		color: theme.colors.minor,
		fontSize: 13 * rt.fontScale,
		lineHeight: 13 * rt.fontScale * 1.2
		// letterSpacing: (14 / 100) * -1
	},
	card__title: {
		color: theme.colors.major,
		fontSize: 16 * rt.fontScale,
		fontWeight: 600
		// letterSpacing: (16 / 100) * -1
	},
	card__time: {
		fontSize: 12 * rt.fontScale,
		fontWeight: 600,
		position: 'absolute',
		top: 0,
		right: 0,
		color: theme.colors.minor400,
		backgroundColor: theme.colors.muted700,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 5,
		paddingVertical: 3,
		paddingRight: 12,
		paddingLeft: 10
	},

	card__dashboard: {
		flexDirection: 'row',
		gap: 12
	}
}))
