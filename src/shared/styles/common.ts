import { StyleSheet } from 'react-native-unistyles'

export const STYLE_VARS = {
	sidePadding_sm: 12,
	sidePadding: 16,
	sidePadding_xl: 28,
	inputPadding: 16,
	insetPlus: 10,
	radius_sm: 5,
	radius_md: 8,
	radius_lg: 12,
	radius_xl: 16,
	radius_2xl: 24,
	radius_3xl: 32,
	navPanelUnderlap: 32
}

export const commonStyles = StyleSheet.create((theme, rt) => ({
	scene: {
		backgroundColor: theme.colors.backgroundAlter
	},

	mainArea: {
		flex: 1,
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: STYLE_VARS.sidePadding,
		paddingBottom: STYLE_VARS.sidePadding + STYLE_VARS.navPanelUnderlap,
		gap: 6
	},

	box: {
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: STYLE_VARS.sidePadding,
		paddingBottom: STYLE_VARS.sidePadding
	},

	header: {
		backgroundColor: theme.colors.surface,
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: STYLE_VARS.insetPlus,
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
		color: theme.colors.minor500,
		marginBottom: 2
	},

	sectionHeader: {
		paddingTop: 5,
		paddingBottom: 3
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
