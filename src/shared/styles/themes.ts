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

export const STATIC_COLORS = {
	transparent: 'transparent',
	white: 'hsl(0, 0%, 100%)',
	black: 'hsl(0, 0%, 0%)'
} as const

export const lightTheme = {
	colors: {
		// Tertiary / disabled text and subtle backgrounds
		// muted500: 'hsl(225, 36%, 75%)',
		// muted600: 'hsl(225, 36%, 82%)',
		// muted700: 'hsl(225, 36%, 87%)',
		// muted800: 'hsl(225, 37%, 93%)',
		// muted900: 'hsl(225, 37%, 96%)',

		// Primary scale: 100-400 darker → 500 base → 600-900 lighter (light theme)
		// primary300: 'hsl(225, 60%, 55%)',
		// primary500: 'hsl(225, 100%, 70%)',
		// primary600: 'hsl(225, 100%, 75%)',
		// primary700: 'hsl(225, 100%, 81%)',
		// primary800: 'hsl(225, 100%, 92%)',
		// primary900: 'hsl(225, 100%, 97%)',

		brandLightest: 'hsl(225, 100%, 97%)',

		// text
		primaryDarker: 'hsl(225, 60%, 55%)',
		primary: 'hsl(225, 100%, 70%)',
		primaryLight: 'hsl(225, 100%, 75%)',
		primaryLighter: 'hsl(225, 100%, 92%)',

		major: 'hsl(224, 15%, 30%)',
		minor: 'hsl(225, 28%, 68%)', // Secondary text (subtitles, placeholders, icons)
		mutedText: 'hsl(225, 36%, 75%)',
		mutedLightText: 'hsl(225, 36%, 82%)',
		mutedLighterText: 'hsl(225, 36%, 87%)',
		mutedLightestText: 'hsl(225, 37%, 93%)',
		buttonText: 'hsl(0, 0%, 100%)',
		success: 'hsl(148, 100%, 66%)',
		danger: 'hsl(355, 100%, 75%)',
		inverse: 'hsl(0, 0%, 100%)',
		currentFill: 'hsl(225, 100%, 92%)',
		currentText: 'hsl(225, 100%, 70%)',
		selectedFill: 'hsl(225, 100%, 70%)',
		selectedText: 'hsl(0, 0%, 100%)',

		surface: 'hsl(0, 0%, 100%)',
		surfaceAlter: 'hsl(228, 56%, 98%)',

		border: 'hsl(240, 5%, 79%)',
		borderLight: 'hsl(240, 5%, 92%)',
		borderLightest: 'hsl(225, 37%, 96%)',

		// table
		thFill: 'hsl(224, 37%, 93%)',
		thText: 'hsl(225, 28%, 68%)',

		ripple: 'rgba(99,125,255,0.15)',
		rippleLight: 'rgba(255,255,255,0.35)',

		shadow100: 'hsla(225, 74%, 40%, .09)',
		shadow150: 'hsla(225, 74%, 40%, .12)',
		shadow200: 'hsla(225, 74%, 40%, .16)',
		shadow: 'hsla(225, 74%, 40%, .55)',

		gradient: [
			'hsl(225, 100%, 75%)',
			'hsl(225, 100%, 70%)',
			'hsl(225, 60%, 55%)'
		]
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

		// Tertiary / disabled text and subtle backgrounds
		muted500: 'hsl(225, 20%, 45%)',
		muted600: 'hsl(225, 18%, 35%)',
		muted700: 'hsl(225, 16%, 28%)',
		muted800: 'hsl(225, 14%, 20%)',
		muted900: 'hsl(225, 14%, 15%)',

		// Primary scale: 100-400 darker → 500 base → 600-900 lighter (dark theme)
		primary300: 'hsl(225, 80%, 75%)',
		primary: 'hsl(225, 100%, 70%)',
		primary600: 'hsl(225, 70%, 60%)',
		primary700: 'hsl(225, 50%, 40%)',
		primary800: 'hsl(225, 40%, 25%)',
		primary900: 'hsl(225, 35%, 18%)',

		// surface
		surface: 'hsl(225, 16%, 14%)',
		surfaceAlter: 'hsl(225, 16%, 8%)',

		border: 'hsl(225, 14%, 28%)',
		borderLight: 'hsl(225, 14%, 22%)',

		shadow100: 'hsla(225, 74%, 5%, .20)',
		shadow150: 'hsla(225, 74%, 5%, .30)',
		shadow200: 'hsla(225, 74%, 5%, .40)',
		shadow: 'hsla(225, 74%, 5%, .70)',

		// table
		thFill: 'hsl(225, 16%, 20%)',
		thText: 'hsl(225, 20%, 50%)',

		// text
		major: 'hsl(224, 20%, 85%)',
		minor: 'hsl(225, 18%, 50%)',
		mutedText: 'hsl(225, 18%, 45%)',
		mutedLightText: 'hsl(225, 18%, 35%)',
		buttonText: 'hsl(0, 0%, 100%)',
		success: 'hsl(148, 80%, 50%)',
		danger: 'hsl(355, 90%, 65%)',
		inverse: 'hsl(224, 15%, 15%)',
		currentFill: 'hsl(225, 40%, 25%)',
		currentText: 'hsl(225, 100%, 70%)',
		selectedFill: 'hsl(225, 100%, 70%)',
		selectedText: 'hsl(0, 0%, 100%)'
	},
	fontSize: lightTheme.fontSize,
	spacing: lightTheme.spacing,
	statusBarColor: 'light'
} as const

export const themes = {
	light: lightTheme,
	dark: darkTheme
}

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
