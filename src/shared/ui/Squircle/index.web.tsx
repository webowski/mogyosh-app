// Squircle.web.tsx
import { forwardRef } from 'react'
import { View } from 'react-native'

const Squircle = forwardRef((props: any, ref) => {
	const { cornerSmoothing, radius, style, ...rest } = props

	// const flattenedStyle = StyleSheet.flatten(style)
	// console.log('Squircle style:', ...style)

	return (
		<View
			ref={ref}
			style={[
				...style,
				{
					borderRadius: style[0].borderRadius * 2,
					cornerShape: 'squircle'
				}
			]}
			{...rest}
		/>
	)
})
Squircle.displayName = 'Squircle'

export { Squircle }
