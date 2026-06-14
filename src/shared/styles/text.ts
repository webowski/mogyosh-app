import { StyleSheet } from 'react-native-unistyles'

export const TEXT_VARS = {
	h1: 26,
	h2: 23,
	h3: 19,
	h4: 17,
	h5: 12
}

export const textStyles = StyleSheet.create((theme, rt) => ({
	heading1: {
		fontSize: rt.fontScale * TEXT_VARS.h1,
		fontWeight: '700',
		color: theme.colors.major,
		letterSpacing: -0.5
	},

	heading2: {
		fontSize: rt.fontScale * TEXT_VARS.h2,
		fontWeight: '600',
		color: theme.colors.major
	},

	heading5: {
		textTransform: 'uppercase',
		fontWeight: '500',
		fontSize: TEXT_VARS.h5,
		lineHeight: TEXT_VARS.h5 * 1.2,
		letterSpacing: TEXT_VARS.h5 * 0.01,
		color: theme.colors.mutedLightText
	},

	// text-align: center;
	// letter-spacing: -0.01em;
	// text-transform: uppercase;

	// color: #BDC6E0;

	label: {
		fontSize: 16,
		fontWeight: 600,
		color: theme.colors.major
	},

	textLarge: {
		fontSize: rt.fontScale * 18,
		color: theme.colors.major
	},

	textMuted: {
		fontSize: rt.fontScale * 14
		// color: theme.colors.textSecondary
	},

	link: {
		color: theme.colors.primary
	}
}))

// default: {
// 	fontSize: 16,
// 	lineHeight: 24
// },
// text: {
// 	// color: theme.colors.text,
// 	variants: {
// 		size: {
// 			h1: { fontSize: rt.fontScale(32), fontWeight: '700' }
// 			// h2: { fontSize: rt.fontScale(24), fontWeight: '600' },
// 			// xl: { fontSize: rt.fontScale(20) },
// 			// lg: { fontSize: rt.fontScale(18) },
// 			// base: { fontSize: rt.fontScale(16) }
// 		},
// 		weight: {
// 			bold: { fontWeight: '700' },
// 			medium: { fontWeight: '500' }
// 		},
// 		color: {
// 			primary: { color: theme.colors.primary },
// 			muted: { color: theme.colors.textSecondary }
// 		}
// 	}
// }
