import { PropsWithChildren } from 'react'
import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { isByTime } from '@/features/TaskList/model/task.utils'
import { TaskEntity } from '@/shared/domain/task'

type TaskItemProps = {
	data: TaskEntity
} & PropsWithChildren

export default function TaskItem({ data, children }: TaskItemProps) {
	console.log(data)
	return (
		<View style={styles.card}>
			<View style={styles.card__columns}>
				<View>
					{/* <Text style={styles.card__category}>Категория • Подкатегория</Text> */}
					<Text style={styles.card__category}>{data.category?.name}</Text>
					<Text style={styles.card__title}>{data.info}</Text>
				</View>
				<View>
					{isByTime(data) && (
						<Text style={styles.card__time}>
							{data.schedules?.[0]?.start_time}
						</Text>
					)}
				</View>
			</View>
			{children}
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	card: {
		padding: 12,
		backgroundColor: theme.colors.surface,
		boxShadow: '0px 2px 4px rgba(102, 140, 255, 0.08)',
		borderRadius: 8
	},
	card__columns: {
		flexDirection: 'row',
		gap: 12,
		justifyContent: 'space-between'
	},
	card__category: {
		color: theme.colors.minor,
		fontSize: 13 * rt.fontScale
		// letterSpacing: (14 / 100) * -1
	},
	card__title: {
		color: theme.colors.major,
		fontSize: 16 * rt.fontScale,
		fontWeight: 600
		// letterSpacing: (16 / 100) * -1
	},
	card__time: {
		color: theme.colors.minor,
		fontSize: 12 * rt.fontScale,
		fontWeight: 600
	}
}))
