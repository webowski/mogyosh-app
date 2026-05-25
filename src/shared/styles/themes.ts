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
		minor: 'hsl(225, 22%, 55%)', // Secondary text (subtitles, placeholders, icons)
		mutedTextDark: 'hsl(225, 28%, 68%)',
		mutedText: 'hsl(225, 36%, 75%)',
		mutedLightText: 'hsl(225, 36%, 82%)',
		mutedLighterText: 'hsl(225, 36%, 87%)',
		mutedLightestText: 'hsl(225, 37%, 93%)',
		buttonText: 'hsl(0, 0%, 100%)',
		success: 'hsl(148, 100%, 66%)',
		danger: 'hsl(355, 100%, 75%)',
		dangerFill: 'hsl(355, 100%, 94%)',
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

		shadeHeader: '0 0px 6px hsla(225, 74%, 40%, .09)',
		shadeDrawer: '0 0px 40px hsla(225, 74%, 40%, .55)',
		shadeNavPanelWrap: '0 0px 32px hsla(225, 74%, 40%, .12)',
		shadeNavPanel: '0 0px 4px hsla(225, 74%, 40%, .12)',
		shadeSwipeSwitchSheet: '0 0px 20px hsla(225, 74%, 40%, .12)',

		shadeCard: '0px 2px 4px hsla(225, 74%, 40%, .09)',

		shadeToggleThumb: '0px 2px 4px rgba(0, 0, 0, 0.18)',
		shadeButton: '0px 5px 10px rgba(26, 35, 126, 0.16)',
		shadeButtonIndicator: '0 0px 0px 3px hsla(225, 74%, 40%, .09)',

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

		brandLightest: 'hsl(225, 80%, 12%)',

		// text
		primaryDarker: 'hsl(225, 100%, 78%)',
		primary: 'hsl(225, 100%, 72%)',
		primaryLight: 'hsl(225, 100%, 65%)',
		primaryLighter: 'hsl(225, 60%, 45%)',

		major: 'hsl(0, 0%, 98%)',
		minor: 'hsl(225, 20%, 72%)',
		mutedText: 'hsl(225, 15%, 62%)',
		mutedLightText: 'hsl(225, 15%, 55%)',
		mutedLighterText: 'hsl(225, 15%, 48%)',
		mutedLightestText: 'hsl(225, 15%, 42%)',
		buttonText: 'hsl(0, 0%, 100%)',
		success: 'hsl(148, 80%, 58%)',
		danger: 'hsl(355, 85%, 68%)',
		inverse: 'hsl(0, 0%, 8%)',
		currentFill: 'hsl(225, 100%, 28%)',
		currentText: 'hsl(225, 100%, 72%)',
		selectedFill: 'hsl(225, 100%, 65%)',
		selectedText: 'hsl(0, 0%, 100%)',

		surface: 'hsl(225, 18%, 9%)',
		surfaceAlter: 'hsl(225, 20%, 13%)',

		border: 'hsl(225, 15%, 24%)',
		borderLight: 'hsl(225, 15%, 19%)',
		borderLightest: 'hsl(225, 20%, 16%)',

		// table
		thFill: 'hsl(225, 20%, 16%)',
		thText: 'hsl(225, 20%, 65%)',

		ripple: 'rgba(120, 140, 255, 0.18)',
		rippleLight: 'rgba(255,255,255,0.08)',

		shadeHeader: '0 0px 6px hsla(225, 0%, 0%, .3)',
		shadeDrawer: '0 0px 40px hsla(225, 0%, 0%, .35)',
		shadeNavPanelWrap: '0 0px 32px hsla(225, 0%, 0%, .2)',
		shadeNavPanel: '0 0px 4px hsla(225, 0%, 0%, .12)',
		shadeSwipeSwitchSheet: '0 0px 20px hsla(225, 0%, 0%, .12)',

		shadeCard: '0px 2px 4px hsla(225, 0%, 0%, .12)',

		shadeToggleThumb: '0px 2px 4px rgba(0, 0, 0, 0.18)',
		shadeButton: '0px 5px 10px rgba(26, 35, 126, 0.16)',
		shadeButtonIndicator: '0 0px 0px 3px hsla(225, 74%, 40%, .09)',

		gradient: [
			'hsl(225, 100%, 68%)',
			'hsl(225, 100%, 62%)',
			'hsl(225, 90%, 52%)'
		]
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
