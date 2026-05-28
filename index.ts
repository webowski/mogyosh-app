// import 'expo-router/entry'
import '@expo/metro-runtime'
import { App } from 'expo-router/build/qualified-entry'
import { renderRootComponent } from 'expo-router/build/renderRootComponent'
import { Platform } from 'react-native'

import '@/shared/i18n'
import '@/shared/styles/themes'

let skiaInitPromise: Promise<void> | null = null
function initSkiaWeb() {
	if (skiaInitPromise) return skiaInitPromise

	skiaInitPromise = import('@shopify/react-native-skia/lib/module/web')
		.then(({ LoadSkiaWeb }) =>
			LoadSkiaWeb({
				locateFile: (file: string) => `/${file}`
			}).then(() => {
				console.log('Skia Web loaded')
			})
		)
		.then(() => {})
		.catch((err) => {
			console.error('Failed to load Skia web:', err)
		})

	return skiaInitPromise
}

// Инициализируем Skia только для веб-платформы перед рендером
if (Platform.OS === 'web') {
	initSkiaWeb().then(() => {
		renderRootComponent(App)
	})
} else {
	renderRootComponent(App)
}
