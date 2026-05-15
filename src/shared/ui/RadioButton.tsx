import { Pressable, PressableProps, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type RadioButtonProps = {
	title: string
	checked: boolean
} & PressableProps

export default function RadioButton({
	title,
	checked,
	...props
}: RadioButtonProps) {
	const { theme } = useUnistyles()

	return (
		<Pressable
			{...props}
			style={[
				styles.RadioItem,
				{
					borderColor: checked ? theme.colors.primary : 'transparent'
				}
			]}
		>
			<View style={[styles.RadioItem__indicator(checked)]} />
			<Text style={styles.RadioItem__text}>{title}</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	RadioItem: {
		// padding: 10,
		// borderRadius: 4,
		backgroundColor: theme.colors.surface,
		// borderWidth: 2,
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		gap: 8
	},
	RadioItem__text: {
		fontSize: 15 * rt.fontScale,
		color: theme.colors.major,
		fontWeight: '500'
	},
	RadioItem__indicator: (checked: boolean) => ({
		marginTop: 6 * rt.fontScale,
		width: 10,
		height: 10,
		borderRadius: 10,
		backgroundColor: checked ? theme.colors.primary : theme.colors.muted700
	})
}))
