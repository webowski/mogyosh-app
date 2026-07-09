import { StyleSheet } from 'react-native-unistyles'

export const SUBITEM_VARS = {
	actionWidth: 58
} as const

export const subitemStyles = StyleSheet.create((theme) => ({
	Bulleted: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		paddingVertical: 4
	},
	Bulleted__marker: {
		// marginLeft: 1,
		// marginRight: 6,
		fontSize: 26,
		lineHeight: 20,
		marginTop: 0,
		marginLeft: 2
		// width: 6,
		// height: 6,
		// borderRadius: 3,
		// backgroundColor: theme.colors.major
	},

	Ordered: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		paddingVertical: 4
	},
	Ordered__marker: {
		// marginTop: 12,
		// marginLeft: 2,
		// width: 6,
		// height: 6,
		// borderRadius: 3,
		// backgroundColor: theme.colors.major,
		marginLeft: 2,
		marginRight: 6,
		fontSize: 16,
		lineHeight: 20,
		fontWeight: 500
	},

	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
