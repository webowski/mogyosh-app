import { StyleSheet } from 'react-native-unistyles'

export const textStyles = StyleSheet.create((theme, rt) => ({
	heading1: {
		fontSize: rt.fontScale * 32,
		fontWeight: '700',
		color: theme.colors.major,
		letterSpacing: -0.5
	},

	heading2: {
		fontSize: rt.fontScale * 24,
		fontWeight: '600',
		color: theme.colors.major
	},

	heading5: {
		textTransform: 'uppercase',
		fontWeight: '500',
		fontSize: 12,
		lineHeight: 12 * 1.2,
		letterSpacing: 12 * 0.01,
		color: theme.colors.mutedLightText
	},

	// text-align: center;
	// letter-spacing: -0.01em;
	// text-transform: uppercase;

	// color: #BDC6E0;

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
