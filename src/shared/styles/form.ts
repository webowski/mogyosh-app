import { StyleSheet } from 'react-native-unistyles'

export const formStyles = StyleSheet.create((theme, rt) => ({
	input: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: theme.colors.surface,
		borderRadius: 24,
		borderWidth: 0,
		border: 0,
		fontSize: 15 * rt.fontScale,
		lineHeight: 15 * 1.25 * rt.fontScale
	},

	formRow: {
		paddingBlock: 9,
		paddingInline: 12,
		backgroundColor: theme.colors.surface,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderRadius: 4,
		marginBlock: 1
	},
	formRow_first: {
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18
	},
	formRow_last: {
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18
	}
}))
