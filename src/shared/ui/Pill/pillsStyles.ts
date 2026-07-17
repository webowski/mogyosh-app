import { StyleSheet } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'

export const pillStyles = StyleSheet.create((theme, rt) => ({
	pills: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: STYLE_VARS.sidePadding,
		backgroundColor: theme.colors.surfaceDeep
	},
	pill: {
		paddingVertical: 5,
		paddingHorizontal: 14,
		borderRadius: 20,
		borderWidth: 1,
		backgroundColor: theme.colors.primarySubtler,
		borderColor: theme.colors.primarySubtle
	},
	pill__active: {
		color: theme.colors.inverse,
		backgroundColor: theme.colors.primarySubtle
	},
	pill__text: {
		fontSize: 14,
		fontWeight: '500' as const,
		color: theme.colors.major
	},
	pill__text_active: {
		color: theme.colors.inverse
	}
}))
