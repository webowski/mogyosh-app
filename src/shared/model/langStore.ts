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
				onRehydrateStorage: () => (state) => {
					if (state) {
						changeLanguage(state.language)
					}
				}
			}
		)
	)
)
