import { StyleSheet } from 'react-native-unistyles'

export const styleVars = {
	sidePadding: 20,
	sidePaddingSm: 14,
	insetPlus: 10
}

export const commonStyles = StyleSheet.create((theme, rt) => ({
	mainArea: {
		flex: 1,
		backgroundColor: theme.colors.backgroundAlter,
		paddingHorizontal: styleVars.sidePadding,
		paddingTop: styleVars.sidePadding,
		paddingBottom: styleVars.sidePadding,
		gap: 8
	},

	scrollIndent: {
		paddingBottom: rt.insets.bottom + styleVars.sidePadding + 70
	},

	scrollBox: {
		flex: 1
	},

	header: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: styleVars.sidePadding,
		paddingTop: styleVars.insetPlus,
		paddingBottom: 14,
		boxShadow: '0 0px 6px ' + theme.colors.shadow100
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: '700',
		lineHeight: 16 * 1.2,
		letterSpacing: 16 * -0.01,
		color: theme.colors.major
	},
	headerSubtitle: {
		fontSize: 15,
		lineHeight: 15 * 1.2,
		letterSpacing: 15 * -0.01,
		color: theme.colors.minor,
		marginBottom: 2
	},

	screen: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: rt.insets.top + 8,
		paddingBottom: rt.insets.bottom + 8
	},

	rowBetween: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},

	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
