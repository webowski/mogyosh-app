import { PropsWithChildren } from 'react'
import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type TaskItemProps = {
	data: {
		id: string
		title: string
	}
} & PropsWithChildren

export default function TaskItem({ data, children }: TaskItemProps) {
	return (
		<View style={styles.card}>
			<View>
				<Text style={styles.card__category}>Категория • Подкатегория</Text>
				<Text style={styles.card__title}>{data.title}</Text>
			</View>
			{children}
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	card: {
		padding: 14,
		backgroundColor: theme.colors.surface,
		boxShadow: '0px 2px 4px rgba(102, 140, 255, 0.08)',
		borderRadius: 8
	},
	card__category: {
		color: theme.colors.muted,
		fontSize: 14 * rt.fontScale
		// letterSpacing: (14 / 100) * -1
	},
	card__title: {
		color: theme.colors.major,
		fontSize: 16 * rt.fontScale,
		fontWeight: 600
		// letterSpacing: (16 / 100) * -1
	}
}))
