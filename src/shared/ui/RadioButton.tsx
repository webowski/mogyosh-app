import { Pressable, PressableProps, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type RadioButtonProps = {
	title: string
	checked: boolean
} & PressableProps

export default function RadioButton({ title, checked }: RadioButtonProps) {
	const { theme } = useUnistyles()

	return (
		<Pressable
			style={[
				styles.RadioItem,
				{
					borderColor: checked ? theme.colors.primary : 'transparent'
				}
			]}
		>
			<View
				style={[
					styles.RadioItem__indicator,
					checked && { backgroundColor: theme.colors.primary }
				]}
			/>
			<Text style={styles.RadioItem__text}>{title}</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create((theme) => ({
	RadioItem: {
		// padding: 10,
		// borderRadius: 4,
		backgroundColor: theme.colors.surface,
		// borderWidth: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start'
	},
	RadioItem__text: {
		fontSize: 15,
		color: theme.colors.major,
		fontWeight: '500'
	},
	RadioItem__indicator: {
		width: 14,
		height: 14,
		borderRadius: 10,
		backgroundColor: theme.colors.primary
	}
}))
