import { getLocales } from 'expo-localization'
import { default as i18n } from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import es from './locales/es.json'
import ja from './locales/ja.json'
import ru from './locales/ru.json'

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en'

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		es: { translation: es },
		ja: { translation: ja },
		ru: { translation: ru }
	},
	lng: deviceLanguage,
	fallbackLng: 'en',
	supportedLngs: ['en', 'ru', 'es', 'ja'],
	interpolation: {
		escapeValue: false
	}
})

export default i18n
export const t = i18n.t.bind(i18n)
