import AsyncStorage from '@react-native-async-storage/async-storage'
import { changeLanguage, t } from 'i18next'
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export type Language = 'en' | 'ru'

interface LangStore {
	language: Language
	t: (key: string) => string
	setLanguage: (language: Language) => void
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
				storage: {
					getItem: async (name) => {
						const value = await AsyncStorage.getItem(name)
						return value ? JSON.parse(value) : null
					},
					setItem: async (name, value) => {
						await AsyncStorage.setItem(name, JSON.stringify(value))
					},
					removeItem: async (name) => {
						await AsyncStorage.removeItem(name)
					}
				},
				onRehydrateStorage: () => (state) => {
					if (state) {
						changeLanguage(state.language)
					}
				}
			}
		)
	)
)
