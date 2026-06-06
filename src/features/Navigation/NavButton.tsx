import React from 'react'
import { Pressable } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

interface NavButtonProps {
	icon: React.ReactElement
	[key: string]: any
}

export default function NavButton({
	isFocused,
	icon,
	style,
	...props
}: NavButtonProps) {
	const { theme } = useUnistyles()
	// const [pressed, setPressed] = useState(false)

	return (
		<Pressable
			hitSlop={2}
			style={({ pressed }) => [
				styles.navButton,
				pressed && styles.navButtonPressed,
				style
			]}
			android_ripple={{
				color: theme.colors.ripple,
				radius: 24
			}}
			// onPressIn={() => setPressed(true)}
			// onPressOut={() => setPressed(false)}
			{...props}
		>
			{({ pressed }) =>
				React.cloneElement(icon, {
					fill:
						isFocused || pressed
							? theme.colors.primary
							: theme.colors.mutedTextDark
				} as any)
			}
		</Pressable>
	)
}

const styles = StyleSheet.create((theme) => ({
	navButton: {
		padding: 8
	},
	navButtonPressed: {
		opacity: 1
	}
}))
