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

const webFontSource =
	Platform.OS === 'web'
		? 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf'
		: null

export function useCanvasFont() {
	const webFont = useFont(webFontSource, CANVAS_FONT_SIZE)
	return Platform.OS === 'web' ? webFont : nativeFont
}
