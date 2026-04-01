import AsyncStorage from '@react-native-async-storage/async-storage'
import { changeLanguage, t } from 'i18next'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

type Language = 'en' | 'ru'

interface LangStore {
	language: Language
	t: (key: string) => string
	setLanguage: (lang: Language) => void
}

export const useLangStore = create<LangStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				language: 'en',
				t: (key) => t(key),
				setLanguage: (language) => {
					set({ language })
					changeLanguage(language)
				}
			}),
			{
				name: 'lang-storage',
				storage: createJSONStorage(() => AsyncStorage),
				onRehydrateStorage: () => (state) => {
					if (state) changeLanguage(state.language)
				}
			}
		)
	)
)
