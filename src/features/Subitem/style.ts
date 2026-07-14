import { StyleSheet } from 'react-native-unistyles'

export const SUBITEM_VARS = {
	actionWidth: 58
} as const

export const subitemStyles = StyleSheet.create((theme) => ({
	Paragraph: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 4
	},

	Bulleted: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 4
	},
	Bulleted__marker: {
		width: 16,
		textAlign: 'center',
		paddingTop: 1,
		fontSize: 28,
		lineHeight: 28,
		fontWeight: 500
	},

	Ordered: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 4
	},
	Ordered__marker: {
		width: 16,
		textAlign: 'right',
		paddingTop: 4,
		fontSize: 16,
		lineHeight: 22,
		fontWeight: 500
	},

	Expandible: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 6
	},
	Expandible__button: { marginTop: 4 },

	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	},

	heading: (headingFontSize: number) => ({
		flex: 1,
		fontSize: headingFontSize,
		fontWeight: 700,
		color: theme.colors.major
	}),

	Block__checkbox: {
		marginTop: 3
	}
}))
