import { create } from 'zustand'

import i18n from '@/shared/i18n'
import { formatNavDate } from '@/shared/lib/time'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { useLangStore } from '@/shared/model/langStore'

const buildSwipeSwitchItems = (selectedDate: Date) => {
	const { t } = useLangStore.getState()

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

interface NavStore {
	swipeSwitchItems: Record<string, string | undefined>[][]
	updateSwitchItems: (selectedDate?: Date) => void
}

export const useNavStore = create<NavStore>((set) => ({
	swipeSwitchItems: buildSwipeSwitchItems(new Date()),
	updateSwitchItems: (selectedDate?: Date) => {
		const date = selectedDate ?? new Date()
		set({ swipeSwitchItems: buildSwipeSwitchItems(date) })
	}
}))

i18n.on('languageChanged', () => {
	const selectedDate = useCalendarStore.getState().selectedDate
	useNavStore.getState().updateSwitchItems(selectedDate)
})

useCalendarStore.subscribe(
	(state) => state.selectedDate,
	(selectedDate) => {
		console.log('subscription on selectedDate')
		useNavStore.getState().updateSwitchItems(selectedDate)
	}
)
