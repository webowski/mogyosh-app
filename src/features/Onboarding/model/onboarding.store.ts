import { createMMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createZustandStorage } from '@/shared/lib/mmkv'

interface OnboardingState {
	hasSeenOnboarding: boolean
	setOnboardingCompleted: () => void
}

const onboardingMMKV = createMMKV({ id: 'onboarding-storage' })
const onboardingZustandStorage = createZustandStorage(onboardingMMKV)

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set) => ({
			hasSeenOnboarding: false,
			setOnboardingCompleted: () => set({ hasSeenOnboarding: true })
		}),
		{
			name: 'onboarding-storage',
			storage: createJSONStorage(() => onboardingZustandStorage)
		}
	)
)
