import { create } from 'zustand'

import i18n from '@/shared/i18n'
import { formatNavDate } from '@/shared/lib/time'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { useLangStore } from '@/shared/model/langStore'

interface NavStore {
	swipeSwitchItems: Record<string, string | undefined>[][]
	updateSwitchItems: () => void
}

const buildSwipeSwitchItems = () => {
	const { t } = useLangStore.getState()
	const selectedDate = useCalendarStore.getState().selectedDate

	return [
		[
			{ allTasks: t('All Tasks') },
			{ index: formatNavDate(selectedDate) },
			{ task: t('Task') }
		],
		[
			{ roadmap: t('Roadmap') },
			{ calendar: t('Calendar') },
			{ statistics: t('Statistics') }
		]
	]
}

export const useNavStore = create<NavStore>((set) => ({
	swipeSwitchItems: buildSwipeSwitchItems(),
	updateSwitchItems: () => {
		set({ swipeSwitchItems: buildSwipeSwitchItems() })
	}
}))

i18n.on('languageChanged', () => {
	useNavStore.getState().updateSwitchItems()
})
