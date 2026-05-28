// import 'expo-router/entry'
import '@expo/metro-runtime'
import { App } from 'expo-router/build/qualified-entry'
import { renderRootComponent } from 'expo-router/build/renderRootComponent'
import { Platform } from 'react-native'

import '@/shared/i18n'
import '@/shared/styles/themes'

// Инициализируем Skia только для веб-платформы перед рендером
if (Platform.OS === 'web') {
	import('@shopify/react-native-skia/lib/module/web').then(
		({ LoadSkiaWeb }) => {
			LoadSkiaWeb({
				locateFile: (file: string) => `/${file}` // ищет canvaskit.wasm в public/
			})
				.then(() => {
					renderRootComponent(App)
				})
				.catch((err) => {
					console.error('Failed to load Skia web:', err)
					renderRootComponent(App)
				})
		}
	)
} else {
	renderRootComponent(App)
}
