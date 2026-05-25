import TextareaAutosize from 'react-textarea-autosize'

type TextareaProps = React.ComponentProps<typeof TextareaAutosize> & {
	onChange?: any
	style?: React.CSSProperties
}

export default function Textarea({ onChange, style, ...props }: TextareaProps) {
	const webStyle = Array.isArray(style)
		? style.reduce(
				(accumulator, styleBlock) => ({ ...accumulator, ...styleBlock }),
				{}
			)
		: style

	return <TextareaAutosize style={webStyle} onChange={onChange} {...props} />
}
