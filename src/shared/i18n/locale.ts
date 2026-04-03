// В Settings — храни выбор пользователя (например, в AsyncStorage или через контекст),
// с вариантами: 'ru-RU' | 'en-US' | 'system'. При 'system' вызывай getSystemLocale().

import { getLocales } from 'expo-localization'

export function getSystemLocale(): string {
	const tag = getLocales()[0]?.languageTag ?? ''

	if (tag.startsWith('ru')) {
		return 'ru-RU'
	} else if (tag.startsWith('es')) {
		return 'es-ES'
	} else if (tag.startsWith('ja')) {
		return 'ja-JP'
	} else {
		return 'en-US'
	}
}
