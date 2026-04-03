// В Settings — храни выбор пользователя (например, в AsyncStorage или через контекст),
// с вариантами: 'ru-RU' | 'en-US' | 'system'. При 'system' вызывай getSystemLocale().

import { getLocales } from 'expo-localization'

export type AppLocale = 'ru-RU' | 'en-US' | 'es-ES'

export function getSystemLocale(): AppLocale {
	const tag = getLocales()[0]?.languageTag ?? ''
	// return tag.startsWith('ru') ? 'ru-RU' : 'en-US'
	if (tag.startsWith('ru')) {
		return 'ru-RU'
	} else if (tag.startsWith('es')) {
		return 'es-ES'
	} else {
		return 'en-US'
	}
}
