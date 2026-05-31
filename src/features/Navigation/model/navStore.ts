import { create } from 'zustand'

import {
	SwipeSwitchItems,
	SwipeSwitchPosition
} from '@/features/Navigation/model/navTypes'
import i18n from '@/shared/i18n'
import { formatNavDate } from '@/shared/lib/time'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { useLangStore } from '@/shared/model/langStore'

const buildSwipeSwitchItems = (selectedDate: Date): SwipeSwitchItems => {
	const { t } = useLangStore.getState()

	return [
		[
			{ allTasks: t('screen.All Tasks') },
			{ index: formatNavDate(selectedDate) },
			{ task: t('screen.Task') }
		],
		[
			{ scheme: t('screen.Scheme') },
			{ calendar: t('screen.Calendar') },
			{ progress: t('screen.Progress') }
		]
	]
}

interface NavStore {
	currentRoute: string | null
	previousRoute: string | null
	updateRoutes: (route: string) => void
	// previousRoute: string | null
	// setPreviousRoute: (route: string) => void

	swipeSwitchItems: SwipeSwitchItems
	updateSwitchItems: (selectedDate?: Date) => void

	isDrawerShown: boolean
	setIsDrawerShown: (isShown: boolean) => void

	swipePosition: SwipeSwitchPosition
	setSwipePosition: (position: SwipeSwitchPosition) => void
	getRoutePosition: (routeName: string) => SwipeSwitchPosition | null

	setSwipeRoute: (route: string) => void

	isActionSheetOpen: boolean
	setIsActionSheetOpen: (isOpen: boolean) => void
	actionSheetItem: SwipeSwitchPosition | null
	setActionSheetItem: (item: SwipeSwitchPosition | null) => void
}

export const useNavStore = create<NavStore>((set, get) => ({
	// previousRoute: null,
	// setPreviousRoute: (route) => {
	// 	const current = get().previousRoute
	// 	if (current !== route) {
	// 		set({ previousRoute: route })
	// 	}
	// },
	currentRoute: null,
	previousRoute: null,
	updateRoutes: (route) =>
		set({
			previousRoute: get().currentRoute,
			currentRoute: route
		}),

	isDrawerShown: false,
	setIsDrawerShown: (isShown: boolean) => {
		set({ isDrawerShown: isShown })
	},

	swipeSwitchItems: buildSwipeSwitchItems(new Date()),
	updateSwitchItems: (selectedDate?: Date) => {
		const date = selectedDate ?? new Date()
		set({ swipeSwitchItems: buildSwipeSwitchItems(date) })
	},

	swipePosition: { row: 0, col: 1 },
	setSwipePosition: ({ row, col }) => {
		set({ swipePosition: { row, col } })
	},
	getRoutePosition: (routeName: string) => {
		const items = get().swipeSwitchItems

		for (let row = 0; row < items.length; row++) {
			for (let col = 0; col < items[row].length; col++) {
				const key = Object.keys(items[row][col])[0]

				if (key === routeName) {
					return { row, col }
				}
			}
		}
		return null
	},

	setSwipeRoute: (route: string) => {
		const position = get().getRoutePosition(route)
		if (position) {
			set({ swipePosition: position })
		}
	},

	isActionSheetOpen: false,
	setIsActionSheetOpen: (isOpen) => set({ isActionSheetOpen: isOpen }),
	actionSheetItem: null,
	setActionSheetItem: (item) => set({ actionSheetItem: item })
}))

i18n.on('languageChanged', () => {
	const selectedDate = useCalendarStore.getState().selectedDate
	useNavStore.getState().updateSwitchItems(selectedDate)
})

useCalendarStore.subscribe(
	(state) => state.selectedDate,
	(selectedDate) => {
		useNavStore.getState().updateSwitchItems(selectedDate)
	}
)
