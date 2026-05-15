import { Platform } from 'react-native'
import { createMMKV } from 'react-native-mmkv'
import {
	StyleSheet,
	UnistylesThemes,
	UnistylesRuntime as rt
} from 'react-native-unistyles'

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
		// sans: "'Spline Sans', 'SF Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		sans: 'Ubuntu, sans-serif',
		serif: "Georgia, 'Times New Roman', serif",
		rounded:
			"'Ubuntu', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
	}
})

export const lightTheme = {
	colors: {
		bright: 'hsl(225, 100%, 100%)',
		major: 'hsl(224, 15%, 30%)',
		minor400: 'hsl(225, 28%, 64%)',
		minor: 'hsl(225, 28%, 68%)',
		// muted: 'hsl(225, 36%, 81%)',
		muted: 'hsl(225, 36%, 75%)',
		muted500: 'hsl(225, 36%, 82%)',
		muted600: 'hsl(225, 36%, 87%)',
		muted700: 'hsl(224, 37%, 93%)',
		muted800: 'hsl(224, 37%, 96%)',
		inverse: 'hsl(0, 0%, 100%)',
		surface: 'hsl(0, 0%, 100%)',
		surfaceAlter: 'hsl(228, 56%, 98%)',
		background: 'hsl(0, 0%, 100%)',
		backgroundAlter: 'hsl(228, 56%, 98%)',
		primary300: 'hsl(225, 60%, 55%)',
		primary: 'hsl(225, 100%, 70%)',
		primary600: 'hsl(225, 100%, 75%)',
		primary700: 'hsl(225, 100%, 81%)',
		primary800: 'hsl(225, 100%, 92%)',
		primary900: 'hsl(225, 100%, 97%)',
		brand: 'hsl(225, 100%, 70%)',
		success: 'hsl(148, 100%, 66%)',
		danger: 'hsl(355, 100%, 75%)',
		border: 'hsl(240, 5%, 79%)',
		border600: 'hsl(240, 5%, 87%)',
		border700: 'hsl(240, 5%, 92%)',
		shadow100: 'hsla(225, 74%, 40%, .09)',
		shadow150: 'hsla(225, 74%, 40%, .12)',
		shadow: 'hsla(225, 74%, 40%, .55)',
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
		...lightTheme.colors,

		major: 'hsl(225, 100%, 100%)',
		minor: 'hsl(225, 28%, 68%)',
		// muted: 'hsl(225, 36%, 78%)',
		muted: 'hsl(225, 36%, 81%)',
		muted600: 'hsl(225, 36%, 87%)',
		muted700: 'hsl(224, 37%, 92%)',
		inverse: 'hsl(0, 0%, 0%)',
		surface: 'hsl(0, 0%, 0%)',
		surfaceAlter: 'hsl(228, 56%, 98%)',
		background: 'hsl(0, 0%, 0%)',
		backgroundAlter: 'hsl(228, 6%, 18%)',
		primary300: 'hsl(225, 60%, 55%)',
		primary: 'hsl(225, 100%, 70%)',
		primary600: 'hsl(225, 100%, 75%)',
		primary800: 'hsl(225, 100%, 92%)',
		primary900: 'hsl(225, 100%, 92%)',
		brand: 'hsl(225, 100%, 70%)',
		success: 'hsl(148, 100%, 66%)',
		danger: 'hsl(355, 100%, 75%)',
		border: 'hsl(240, 2%, 22%)',
		border600: 'hsl(240, 5%, 87%)',
		border700: 'hsl(240, 5%, 92%)',
		shadow100: 'hsla(225, 0%, 0%, .09)',
		shadow150: 'hsla(225, 0%, 0%, .12)',
		shadow: 'hsla(225, 0%, 0%, .55)',
		// gradient: {
		// 	primary: ['', ''],
		// 	surface: ['', '']
		// }
		buttonText: 'hsl(0, 0%, 100%)'
	},
	fontSize: lightTheme.fontSize,
	spacing: lightTheme.spacing,
	statusBarColor: 'light'
} as const

// export const sunnyTheme = {
// 	colors: {
// 		major: 'hsl(224, 15%, 30%)',
// 		minor: 'hsl(225, 28%, 68%)',
// 		muted: 'hsl(225, 36%, 78%)',
// 		muted600: 'hsl(225, 36%, 87%)',
// 		muted700: 'hsl(224, 37%, 92%)',
// 		inverse: 'hsl(0, 0%, 100%)',
// 		surface: 'hsl(0, 0%, 100%)',
// 		surfaceAlter: 'hsl(228, 56%, 98%)',
// 		background: 'hsl(0, 0%, 0%)',
// 		backgroundAlter: 'hsl(228, 56%, 98%)',
// 		primary300: 'hsl(225, 60%, 55%)',
// 		primary: 'hsl(60, 100%, 57%)',
// 		primary800: 'hsl(225, 100%, 92%)',
// 		brand: 'hsl(225, 100%, 70%)',
// 		success: 'hsl(148, 100%, 66%)',
// 		danger: 'hsl(355, 100%, 75%)',
// 		border: 'hsl(240, 2%, 22%)',
// 		border600: 'hsl(240, 5%, 87%)',
// 		border700: 'hsl(240, 5%, 92%)',
// 		shadow100: 'hsla(225, 74%, 40%, .09)',
// 		shadow150: 'hsla(225, 74%, 40%, .12)',
// 		shadow: 'hsla(225, 74%, 40%, .55)',
// 		// gradient: {
// 		// 	primary: ['', ''],
// 		// 	surface: ['', '']
// 		// }
// 		buttonText: 'hsl(0, 0%, 100%)'
// 	},
// 	fontSize: lightTheme.fontSize,
// 	spacing: lightTheme.spacing
// } as const

export const themes = {
	light: lightTheme,
	dark: darkTheme
}
// sunny: sunnyTheme

// const breakpoints = {
// 	xs: 0,
// 	sm: 300,
// 	md: 500,
// 	lg: 800,
// 	xl: 1200
// } as const

// type AppBreakpoints = typeof breakpoints
type Themes = typeof themes

declare module 'react-native-unistyles' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export interface UnistylesThemes extends Themes {}
	// export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
	settings: {
		initialTheme: () => {
			const storage = createMMKV({ id: 'settings-storage' })
			return (
				(storage.getString('currentTheme') as keyof UnistylesThemes) ?? 'light'
			)
		}
	},
	// breakpoints,
	themes: themes
})
