import { StyleSheet } from 'react-native-unistyles'

export const SUBITEM_VARS = {
	actionWidth: 58
} as const

export const blockStyles = StyleSheet.create((theme) => ({
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
		fontWeight: '500' as const
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
		fontWeight: '500' as const
	},

	Expandible: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 6
	},
	Expandible__button: { marginTop: 4 },

	Timer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: theme.colors.surface,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: theme.colors.borderSubtlest
	},

	Timer__body: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 0,
		paddingHorizontal: 12,
		paddingVertical: 8
	},

	Timer__label: {
		fontSize: 16,
		fontWeight: '500',
		color: theme.colors.major
	},

	Timer__time: {
		fontSize: 17,
		fontWeight: '400',
		color: theme.colors.minor,
		fontVariantNumeric: 'tabular-nums'
	},

	Timer__actions: {
		minHeight: 52,
		width: SUBITEM_VARS.actionWidth,
		padding: 8,
		borderLeftWidth: 1,
		borderColor: theme.colors.borderSubtlest,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch'
	},

	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: '500' as const,
		color: theme.colors.major
	},

	heading: (headingFontSize: number) => ({
		flex: 1,
		fontSize: headingFontSize,
		fontWeight: '700' as const,
		color: theme.colors.major
	}),

	Block__checkbox: {
		marginTop: 3
	}
}))
