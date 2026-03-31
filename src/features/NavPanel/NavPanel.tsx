import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'

import { ParamListBase, TabNavigationState } from '@react-navigation/native'
import { SharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import NavButton from './NavButton'
import SwipeSwitch from './SwipeSwitch'

import SVGIconBurger from '@/shared/images/icons/burger.svg'
import SVGIconPlus from '@/shared/images/icons/plus.svg'
import SVGIconTarget from '@/shared/images/icons/target.svg'

import { useNavStore } from '@/shared/model/navStore'
import { useTimeStore } from '@/shared/model/timeStore'

type NavPanelProps = BottomTabBarProps & {
	isDrawerShown: SharedValue<boolean>
}

// Helper function to format date as DD.MM.YY
function formatDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = String(date.getFullYear()).slice(-2)
	return `${day}.${month}.${year}`
}

export default function NavPanel({
	state,
	descriptors,
	navigation,
	isDrawerShown
}: NavPanelProps) {
	// const { buildHref } = useLinkBuilder()
	const insets = useSafeAreaInsets()
	// const { theme } = useUnistyles()

	// Get selected date and swipe switch items from store
	const selectedDate = useTimeStore((state) => state.selectedDate)
	const swipeSwitchItems = useNavStore((state) => state.swipeSwitchItems)

	// Track current route for transition effects - ensure correct initialization
	const currentRoute = state.routes[state.index]?.name || 'index'

	// Generate dynamic slide labels - show formatted date for today route
	const getSlideLabel = (
		row: number,
		col: number,
		defaultLabel: string
	): string => {
		// Check if this is the "Today" slide (row 0, col 1) and current route is "today"
		if (row === 0 && col === 1 && currentRoute === 'day') {
			return formatDate(selectedDate)
		}
		return defaultLabel
	}

	// Проверяет если currentRoute соответствует ЛЮБОЙ точке SwipeSwitch
	const isAnySwipeRouteActive = (
		routeName: string,
		items: Record<string, string | undefined>[][]
	): boolean => {
		for (const row of items) {
			for (const item of row) {
				if (Object.keys(item)[0] === routeName) {
					return true
				}
			}
		}
		return false
	}

	// Handle SwipeSwitch navigation with animated transitions
	const handleSwipeSwitchChange = (row: number, col: number) => {
		const routeItem = swipeSwitchItems[row]?.[col]
		if (routeItem) {
			const routeName = Object.keys(routeItem)[0]
			// Only navigate if we're not already on that route
			if (currentRoute !== routeName) {
				navigation.navigate(routeName)
			}
		}
	}

	const handleSwipeSwitchPress = (row: number, col: number) => {
		const routeItem = swipeSwitchItems[row]?.[col]
		if (routeItem) {
			const routeName = Object.keys(routeItem)[0]
			// Only navigate if we're not already on that route
			if (currentRoute !== routeName) {
				navigation.navigate(routeName)
			}
		}
	}

	return (
		<View
			style={[
				styles.navPanelContainer,
				{
					paddingBottom: insets.bottom === 0 ? 22 : insets.bottom
				}
			]}
		>
			<NavButton
				onPress={() => {
					isDrawerShown.value = true
				}}
				icon={<SVGIconBurger width={32} height={32} />}
			/>

			<NavButton
				isFocused={isCurrentRoute('motivation', state)}
				onPress={() => navigation.navigate('motivation')}
				icon={<SVGIconTarget width={36} height={36} />}
			/>

			<SwipeSwitch
				currentRoute={currentRoute}
				onIndexChange={handleSwipeSwitchChange}
				onPress={handleSwipeSwitchPress}
				isActive={isAnySwipeRouteActive(currentRoute, swipeSwitchItems)}
				getSlideLabel={getSlideLabel}
			/>

			<NavButton
				isFocused={isCurrentRoute('createTask', state)}
				onPress={() => navigation.navigate('createTask')}
				icon={<SVGIconPlus width={32} height={32} />}
			/>
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	navPanelContainer: {
		height: 70,
		paddingBottom: rt.insets.bottom === 0 ? 22 : rt.insets.bottom,
		paddingHorizontal: 18,
		zIndex: 10,
		boxSizing: 'content-box',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.background,
		borderStartStartRadius: 32,
		borderStartEndRadius: 32,
		borderCurve: 'continuous',

		// ios shadow
		// shadowColor: theme.colors.primary,
		shadowColor: 'hsl(225, 74%, 40%)',
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowOpacity: 0.2,
		shadowRadius: 40,

		// Android shadow
		elevation: 8
	}
}))

function isCurrentRoute(
	routeName: string,
	state: TabNavigationState<ParamListBase>
) {
	const currentRouteName = state.routes[state.index]?.name
	return currentRouteName === routeName
}
