import Drawer from '@/features/Drawer/Drawer'
import Header from '@/features/Header/Header'
import { default as HeaderDay } from '@/features/Header/HeaderDay'
import HeaderTask from '@/features/Header/HeaderTask'
import NavPanel from '@/features/NavPanel/NavPanel'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useSharedValue } from 'react-native-reanimated'

import { useUnistyles } from 'react-native-unistyles'

export default function NavPanelLayout() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	const isDrawerShown = useSharedValue(false)
	const drawerWidth = useSharedValue(1000)
	const drawerTranslateX = useSharedValue(-1000)

	return (
		<>
			<Drawer
				isShown={isDrawerShown}
				width={drawerWidth}
				translateX={drawerTranslateX}
			/>
			<Tabs
				tabBar={(props) => (
					<NavPanel {...props} isDrawerShown={isDrawerShown} />
				)}
				screenOptions={{
					tabBarShowLabel: false,
					tabBarActiveTintColor: theme.colors.primary,
					headerShown: false
					// tabBarButton: HapticTab
				}}
			>
				<Tabs.Screen
					name='motivation'
					options={{
						title: t('Motivation'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='allTasks'
					options={{
						title: t('All Tasks'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='roadmap'
					options={{
						title: t('Roadmap'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='index'
					options={{
						title: t('Today'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderDay {...props} />
					}}
				/>
				<Tabs.Screen
					name='calendar'
					options={{
						title: t('Calendar'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='task'
					options={{
						title: t('Task'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderTask {...props} />
					}}
				/>
				<Tabs.Screen
					name='statistics'
					options={{
						title: t('Statistics'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderTask {...props} />
					}}
				/>
			</Tabs>
		</>
	)
}
