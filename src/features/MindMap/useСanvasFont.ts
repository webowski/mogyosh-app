import { matchFont, useFont } from '@shopify/react-native-skia'
import { Platform } from 'react-native'

export function useCanvasFont(fontSize: number) {
	const nativeFont =
		Platform.OS !== 'web'
			? matchFont({
					fontFamily: Platform.select({
						ios: 'Helvetica Neue',
						android: 'sans-serif'
					})!,
					fontSize,
					fontWeight: 'normal'
				})
			: null

	const webFontSource =
		Platform.OS === 'web'
			? 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf'
			: null

	const webFont = useFont(webFontSource, fontSize)

	return Platform.OS === 'web' ? webFont : nativeFont
}
