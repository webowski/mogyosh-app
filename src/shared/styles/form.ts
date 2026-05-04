import { StyleSheet } from 'react-native-unistyles'

export const formStyles = StyleSheet.create((theme, rt) => ({
	input: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: theme.colors.background,
		borderRadius: 24,
		borderWidth: 0,
		border: 0,
		fontSize: 15 * rt.fontScale,
		lineHeight: 15 * 1.25 * rt.fontScale
	}
}))
