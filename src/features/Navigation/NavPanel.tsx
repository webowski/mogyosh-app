import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'

import { ParamListBase, TabNavigationState } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import NavButton from './NavButton'
import SwipeSwitch from './SwipeSwitch'

import SVGIconBurger from '@/shared/images/icons/burger.svg'
import SVGIconPlus from '@/shared/images/icons/plus.svg'
import SVGIconTarget from '@/shared/images/icons/target.svg'

import { SwipeSwitchItems } from '@/features/Navigation/model/navTypes'
import { createTaskSheetRef } from '@/features/TaskList/CreateTask/CreateTaskSheet'
import { useCalendarStore } from '@/shared/model/calendarStore'
import { STYLE_VARS } from '@/shared/styles/common'
import { useNavStore } from './model/navStore'

type NavPanelProps = BottomTabBarProps

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
	navigation
}: NavPanelProps) {
	// const { buildHref } = useLinkBuilder()
	const insets = useSafeAreaInsets()

	const setIsDrawerShown = useNavStore((store) => store.setIsDrawerShown)

	// Get selected date and swipe switch items from store
	const selectedDate = useCalendarStore((state) => state.selectedDate)
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
		items: SwipeSwitchItems
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

	// Handle SwipeSwitch press for navigation
	const handleSwipeSwitchPress = (row: number, col: number) => {
		const routeItem = swipeSwitchItems[row]?.[col]
		if (routeItem) {
			const routeName = Object.keys(routeItem)[0]
			if (currentRoute !== routeName) {
				navigation.navigate(routeName)
			}
		}
	}

	// Handle SwipeSwitch position change (from swipe or programmatic)
	const handleSwipeSwitchChange = (row: number, col: number) => {
		const routeItem = swipeSwitchItems[row]?.[col]
		if (routeItem) {
			const routeName = Object.keys(routeItem)[0]
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
					paddingBottom: insets.bottom > 0 ? insets.bottom : 24
				}
			]}
		>
			<NavButton
				onPress={() => setIsDrawerShown(true)}
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

			{/* <NavButton
				isFocused={isCurrentRoute('createTask', state)}
				onPress={() => navigation.navigate('createTask')}
				icon={<SVGIconPlus width={32} height={32} />}
			/> */}
			<NavButton
				isFocused={false} // sheet не имеет фокуса маршрута
				onPress={() => createTaskSheetRef.current?.present()}
				icon={<SVGIconPlus width={32} height={32} />}
			/>
		</View>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	navPanelContainer: {
		height: 70,
		paddingHorizontal: 18,
		zIndex: 10,
		boxSizing: 'content-box',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.background,
		borderTopLeftRadius: STYLE_VARS.radius_3xl,
		borderTopRightRadius: STYLE_VARS.radius_3xl,
		borderCurve: 'continuous',
		boxShadow: '0 0px 40px ' + theme.colors.shadow150
	}
}))

function isCurrentRoute(
	routeName: string,
	state: TabNavigationState<ParamListBase>
) {
	const currentRouteName = state.routes[state.index]?.name
	return currentRouteName === routeName
}
