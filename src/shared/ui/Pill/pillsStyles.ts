import { StyleSheet } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'

export const pillStyles = StyleSheet.create((theme, rt) => ({
	pills: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: STYLE_VARS.sidePadding,
		backgroundColor: 'black'
	},
	pill: {
		backgroundColor: theme.colors.primary800,
		paddingVertical: 5,
		paddingHorizontal: 14,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: theme.colors.primary
	},
	pill__active: {
		color: theme.colors.inverse,
		backgroundColor: theme.colors.primary
	},
	pill__text: {
		fontSize: 14,
		fontWeight: 500,
		color: theme.colors.major
	},
	pill__text_active: {
		color: theme.colors.inverse
	}
}))
