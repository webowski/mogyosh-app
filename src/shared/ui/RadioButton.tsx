import { Pressable, PressableProps, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type RadioButtonProps = {
	title: string
	checked: boolean
	style?: PressableProps['style']
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
			style={
				[
					styles.RadioItem,
					{
						borderColor: checked ? theme.colors.primary : 'transparent'
					},
					props.style
				] as PressableProps['style']
			}
		>
			<View style={[styles.RadioItem__indicator(checked)]}>
				{checked && (
					<View
						style={{
							width: 6,
							height: 6,
							borderRadius: 4,
							backgroundColor: theme.colors.inverse
						}}
					/>
				)}
			</View>
			<Text style={styles.RadioItem__text}>{title}</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	RadioItem: {
		backgroundColor: theme.colors.surface,
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		gap: 10
	},
	RadioItem__text: {
		fontSize: 16 * rt.fontScale,
		color: theme.colors.major,
		fontWeight: '400'
	},
	RadioItem__indicator: (checked: boolean) => ({
		marginTop: 2 * rt.fontScale,
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: checked ? theme.colors.primary : 'transparent',
		borderWidth: checked ? 0 : 2,
		borderColor: theme.colors.mutedLighterText,
		alignItems: 'center',
		justifyContent: 'center'
	})
}))
