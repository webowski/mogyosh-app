import { Platform } from 'react-native'
import { StyleSheet, UnistylesRuntime as rt } from 'react-native-unistyles'

export const Fonts = Platform.select({
	ios: {
		/** iOS `UIFontDescriptorSystemDesignDefault` */
		sans: 'system-ui',
		/** iOS `UIFontDescriptorSystemDesignSerif` */
		serif: 'ui-serif',
		/** iOS `UIFontDescriptorSystemDesignRounded` */
		rounded: 'ui-rounded',
		/** iOS `UIFontDescriptorSystemDesignMonospaced` */
		mono: 'ui-monospace'
	},
	default: {
		sans: 'normal',
		serif: 'serif',
		rounded: 'normal',
		mono: 'monospace'
	},
	web: {
		// sans: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", "Noto Sans Arabic", "Noto Sans Hebrew", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded:
			"'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
	}
})

export const lightTheme = {
	colors: {
		major: 'hsl(224, 15%, 30%)',
		minor: 'hsl(225, 28%, 68%)',
		muted: 'hsl(225, 36%, 78%)',
		muted600: 'hsl(225, 36%, 87%)',
		muted700: 'hsl(224, 37%, 92%)',
		inverse: 'hsl(0, 0%, 100%)',
		surface: 'hsl(0, 0%, 100%)',
		surfaceAlter: 'hsl(228, 56%, 98%)',
		background: 'hsl(0, 0%, 100%)',
		backgroundAlter: 'hsl(228, 56%, 98%)',
		primary300: 'hsl(225, 60%, 55%)',
		primary: 'hsl(225, 100%, 70%)',
		primary800: 'hsl(225, 100%, 92%)',
		brand: 'hsl(225, 100%, 70%)',
		success: 'hsl(148, 100%, 66%)',
		danger: 'hsl(355, 100%, 75%)',
		border: 'hsl(240, 5%, 79%)',
		border600: 'hsl(240, 5%, 87%)',
		border700: 'hsl(240, 5%, 92%)',
		// gradient: {
		// 	primary: ['', ''],
		// 	surface: ['', '']
		// }
		buttonText: 'hsl(0, 0%, 100%)'
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24
	},
	fontSize: {
		xxs: rt.fontScale * 12,
		xs: rt.fontScale * 13,
		sm: rt.fontScale * 14,
		md: rt.fontScale * 15,
		lg: rt.fontScale * 16,
		xl: rt.fontScale * 18
	},
	statusBarColor: 'dark'
} as const

export const darkTheme = {
	colors: {
		primary: '#0A84FF', // чуть светлее для dark mode
		primaryDark: '#0066CC',
		background: '#000000',
		card: '#1C1C1E',
		text: '#FFFFFF',
		textSecondary: '#8E8E93',
		border: '#38383A'
	},
	fontSize: lightTheme.fontSize,
	spacing: lightTheme.spacing
} as const

export const sunnyTheme = {
	colors: {
		minor: '#97A2C4',
		primary: '#fFff22',
		primaryDark: '#0066CC',
		background: '#000000',
		card: '#1C1C1E',
		text: '#FFFFFF',
		textSecondary: '#8E8E93',
		border: '#38383A'
	},
	fontSize: lightTheme.fontSize,
	spacing: lightTheme.spacing
} as const

export const appThemes = {
	light: lightTheme
	// dark: darkTheme,
	// sunny: sunnyTheme
}

// const breakpoints = {
// 	xs: 0,
// 	sm: 300,
// 	md: 500,
// 	lg: 800,
// 	xl: 1200
// } as const

// type AppBreakpoints = typeof breakpoints
type AppThemes = typeof appThemes

declare module 'react-native-unistyles' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export interface UnistylesThemes extends AppThemes {}
	// export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
	settings: {
		initialTheme: 'light'
		// initialTheme: () =>  {
		//     // get preferred theme from user's preferences/MMKV/SQL/StanJS etc.
		//     return storage.getString('preferredTheme') ?? 'light'
		// }
	},
	// breakpoints,
	themes: appThemes
})

/**
 * DRAFT colors
 */

// const tintColorLight = '#0a7ea4'
// const tintColorDark = '#fff'

// export const Colors = {
// 	light: {
// 		major: '',
// 		minor: '',
// 		muted: '',
// 		disabled: '',
// 		primary: '#668CFF',
// 		text: '#11181C',
// 		background: '#fff',
// 		tint: tintColorLight,
// 		icon: '#687076',
// 		tabIconDefault: '#687076',
// 		tabIconSelected: tintColorLight
// 	},
// 	dark: {
// 		primary: '#668CFF',
// 		text: '#ECEDEE',
// 		background: '#151718',
// 		tint: tintColorDark,
// 		icon: '#9BA1A6',
// 		tabIconDefault: '#9BA1A6',
// 		tabIconSelected: tintColorDark
// 	}
// }
