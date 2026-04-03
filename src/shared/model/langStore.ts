import AsyncStorage from '@react-native-async-storage/async-storage'
import { changeLanguage, t } from 'i18next'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

interface LangStore {
	language: string
	t: (key: string) => string
	setLanguage: (lang: string) => void
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
