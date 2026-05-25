import { TextInput, ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

type TextareaProps = React.ComponentProps<typeof TextInput> & {
	onChange?: any
	style?: ViewStyle | ViewStyle[]
}

export default function Textarea({ onChange, style, ...props }: TextareaProps) {
	const { theme } = useUnistyles()

	return (
		<TextInput
			{...props}
			style={style}
			multiline
			onChangeText={onChange}
			returnKeyType='next'
			scrollEnabled={false}
			placeholderTextColor={theme.colors.minor}
		/>
	)
}
