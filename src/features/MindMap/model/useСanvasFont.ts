import { matchFont, useFont } from '@shopify/react-native-skia'
import { Platform } from 'react-native'

export const CANVAS_FONT_SIZE = 15

const nativeFont =
	Platform.OS !== 'web'
		? matchFont({
				fontFamily: Platform.select({
					ios: 'Helvetica Neue',
					android: 'sans-serif'
				})!,
				fontSize: CANVAS_FONT_SIZE,
				fontWeight: 'normal'
			})
		: null

const nativeFontBold =
	Platform.OS !== 'web'
		? matchFont({
				fontFamily: Platform.select({
					ios: 'Helvetica Neue',
					android: 'sans-serif'
				})!,
				fontSize: CANVAS_FONT_SIZE,
				fontWeight: 'bold'
			})
		: null

const webFontSource =
	Platform.OS === 'web'
		? 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf'
		: null

const webFontBoldSource =
	Platform.OS === 'web'
		? 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc4.ttf'
		: null

export function useCanvasFont() {
	const webFont = useFont(webFontSource, CANVAS_FONT_SIZE)
	const webFontBold = useFont(webFontBoldSource, CANVAS_FONT_SIZE)

	if (Platform.OS === 'web') {
		return { font: webFont, fontBold: webFontBold }
	}

	return { font: nativeFont, fontBold: nativeFontBold }
}
