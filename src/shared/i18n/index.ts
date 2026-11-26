import { getLocales } from 'expo-localization'
import { default as i18n } from 'i18next'
import { initReactI18next } from 'react-i18next'

import enContent from './locales/content/en.json'
import en from './locales/en.json'
// import es from './locales/es.json'
// import ja from './locales/ja.json'
import ruContent from './locales/content/ru.json'
import ru from './locales/ru.json'

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en'

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en, content: enContent },
		// es: { translation: es },
		// ja: { translation: ja },
		ru: { translation: ru, content: ruContent }
	},
	lng: deviceLanguage,
	fallbackLng: 'en',
	defaultNS: 'translation',
	supportedLngs: [
		'en',
		'ru'
		// 'es',
		// 'ja'
	],
	interpolation: {
		escapeValue: false
	}
})

export default i18n
export const t = i18n.t.bind(i18n)
