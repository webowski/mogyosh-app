import { StyleSheet } from 'react-native-unistyles'

export const SUBITEM_VARS = {
	actionWidth: 58
} as const

export const blockStyles = StyleSheet.create((theme, rt) => ({
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
		color: theme.colors.major,
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
		color: theme.colors.major,
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

	Penoblok: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor:
			rt.themeName === 'light' ? theme.colors.borderSubtlest : 'transparent',
		borderRadius: 6
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

	Stopwatch__body: {
		flex: 1,
		gap: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 8
	},

	Stopwatch__label: {
		fontSize: 16,
		fontWeight: '500',
		color: theme.colors.major
	},

	Stopwatch__time: {
		fontSize: 17,
		fontWeight: '400',
		color: theme.colors.minor,
		fontVariantNumeric: 'tabular-nums'
	},

	Stopwatch__actions: {
		minHeight: 52,
		width: SUBITEM_VARS.actionWidth,
		padding: 8,
		borderLeftWidth: 1,
		borderColor: theme.colors.borderSubtlest,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch'
	},

	// Timer: {
	// 	flexDirection: 'row',
	// 	alignItems: 'center',
	// 	gap: 10,
	// 	backgroundColor: theme.colors.surface,
	// 	borderRadius: 6,
	// 	borderWidth: 1,
	// 	borderColor: theme.colors.borderSubtlest
	// },

	// Timer__body: {
	// 	flex: 1,
	// 	gap: 0,
	// 	flexDirection: 'row',
	// 	justifyContent: 'space-between',
	// 	paddingHorizontal: 12,
	// 	paddingVertical: 8
	// },

	// Timer__label: {
	// 	fontSize: 16,
	// 	fontWeight: '500',
	// 	color: theme.colors.major
	// },

	// Timer__actions: {
	// 	minHeight: 52,
	// 	width: SUBITEM_VARS.actionWidth,
	// 	padding: 8,
	// 	borderLeftWidth: 1,
	// 	borderColor: theme.colors.borderSubtlest,
	// 	justifyContent: 'center',
	// 	alignItems: 'center',
	// 	alignSelf: 'stretch'
	// },

	CounterSet: {
		flexDirection: 'row',
		gap: 10
	},
	Counter: {
		flexDirection: 'row',
		gap: 2,
		alignItems: 'baseline'
	},
	Counter__value: {
		fontSize: 17,
		fontWeight: '400',
		color: theme.colors.minor,
		fontVariantNumeric: 'tabular-nums'
	},
	Counter__units: {
		fontSize: 13,
		fontWeight: '400',
		color: theme.colors.mutedText
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
