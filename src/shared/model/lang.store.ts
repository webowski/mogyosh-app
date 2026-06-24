import { changeLanguage, t } from 'i18next'
import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import {
	createJSONStorage,
	persist,
	subscribeWithSelector
} from 'zustand/middleware'

import { createZustandStorage } from '@/shared/lib/mmkv'

const storage = createMMKV({ id: 'lang-storage' })
const zustandStorage = createZustandStorage(storage)

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
				storage: createJSONStorage(() => zustandStorage),
				onRehydrateStorage: () => (state) => {
					if (state) changeLanguage(state.language)
				}
			}
		)
	)
)
