import { PropsWithChildren } from 'react'
import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default function TaskItem({ children }: PropsWithChildren) {
	return (
		<View>
			<View>
				<Text>Категория</Text>
				<Text style={styles.title}>Заголовок задачи</Text>
			</View>
			{children}
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	title: {
		color: theme.colors.major
	}
}))
