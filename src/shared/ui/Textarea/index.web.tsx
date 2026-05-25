import { StyleProp, ViewStyle } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { getWebProps } from 'react-native-unistyles/web'
import TextareaAutosize from 'react-textarea-autosize'

type TextareaProps = React.ComponentProps<typeof TextareaAutosize> & {
	onChange?: any
	style?: StyleProp<ViewStyle>
}

export default function Textarea({ onChange, style, ...props }: TextareaProps) {
	const { theme } = useUnistyles()
	const { className } = getWebProps(style as any)

	return (
		<TextareaAutosize
			style={{ '--placeholder-color': theme.colors.mutedText } as any}
			className={className}
			onChange={onChange}
			{...props}
		/>
	)
}
