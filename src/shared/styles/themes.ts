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
		// Text on colored/primary backgrounds — always white for contrast
		inverse: 'hsl(0, 0%, 100%)',

		// Primary text (headings, body, high emphasis)
		major: 'hsl(224, 15%, 30%)',

		// Secondary text (subtitles, placeholders, icons)
		minor400: 'hsl(225, 28%, 64%)',
		minor500: 'hsl(225, 28%, 68%)',

		// Tertiary / disabled text and subtle backgrounds
		muted500: 'hsl(225, 36%, 75%)',
		muted600: 'hsl(225, 36%, 82%)',
		muted700: 'hsl(225, 36%, 87%)',
		muted800: 'hsl(224, 37%, 93%)',
		muted900: 'hsl(224, 37%, 96%)',

		// Surfaces
		surface: 'hsl(0, 0%, 100%)',
		surfaceAlter: 'hsl(228, 56%, 98%)',
		background: 'hsl(0, 0%, 100%)',
		backgroundAlter: 'hsl(228, 56%, 98%)',

		// Primary scale: 100-400 darker → 500 base → 600-900 lighter (light theme)
		primary300: 'hsl(225, 60%, 55%)',
		primary500: 'hsl(225, 100%, 70%)',
		primary600: 'hsl(225, 100%, 75%)',
		primary700: 'hsl(225, 100%, 81%)',
		primary800: 'hsl(225, 100%, 92%)',
		primary900: 'hsl(225, 100%, 97%)',

		// Functional
		success: 'hsl(148, 100%, 66%)',
		danger: 'hsl(355, 100%, 75%)',

		// Borders: 500 base → 600-900 lighter
		border: 'hsl(240, 5%, 79%)',
		border700: 'hsl(240, 5%, 92%)',

		// Shadows
		shadow100: 'hsla(225, 74%, 40%, .09)',
		shadow150: 'hsla(225, 74%, 40%, .12)',
		shadow200: 'hsla(225, 74%, 40%, .16)',
		shadow: 'hsla(225, 74%, 40%, .55)',

		// deprecated: duplicate of inverse, kept temporarily for button text on primary
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
		inverse: 'hsl(0, 0%, 100%)',

		major: 'hsl(225, 30%, 92%)',

		minor400: 'hsl(225, 20%, 50%)',
		minor500: 'hsl(225, 20%, 55%)',

		muted500: 'hsl(225, 20%, 45%)',
		muted600: 'hsl(225, 20%, 55%)',
		muted700: 'hsl(225, 20%, 65%)',
		muted800: 'hsl(225, 20%, 75%)',
		muted900: 'hsl(225, 20%, 85%)',

		surface: 'hsl(228, 16%, 14%)',
		surfaceAlter: 'hsl(228, 18%, 18%)',
		background: 'hsl(228, 20%, 8%)',
		backgroundAlter: 'hsl(228, 18%, 12%)',

		// Primary scale: 100-400 lighter → 500 base → 600-900 darker (dark theme)
		primary300: 'hsl(225, 100%, 85%)',
		primary500: 'hsl(225, 100%, 68%)',
		primary600: 'hsl(225, 100%, 58%)',
		primary700: 'hsl(225, 100%, 48%)',
		primary800: 'hsl(225, 100%, 38%)',
		primary900: 'hsl(225, 100%, 28%)',

		success: 'hsl(148, 80%, 55%)',
		danger: 'hsl(355, 90%, 65%)',

		border: 'hsl(240, 10%, 25%)',
		border700: 'hsl(240, 10%, 18%)',

		shadow100: 'hsla(225, 50%, 5%, .20)',
		shadow150: 'hsla(225, 50%, 5%, .30)',
		shadow200: 'hsla(225, 50%, 5%, .40)',
		shadow: 'hsla(225, 50%, 2%, .70)',

		buttonText: 'hsl(0, 0%, 100%)'
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
