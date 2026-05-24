import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useUnistyles } from 'react-native-unistyles'

import Drawer from '@/features/Drawer/Drawer'
import Header from '@/features/Header/Header'
import HeaderCalendar from '@/features/Header/HeaderCalendar'
import { default as HeaderDay } from '@/features/Header/HeaderDay'
import HeaderTask from '@/features/Header/HeaderTask'
import NavPanel from '@/features/Navigation/NavPanel'

export default function NavPanelLayout() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	return (
		<>
			<Drawer />
			<Tabs
				tabBar={(props) => <NavPanel {...props} />}
				screenOptions={{
					tabBarShowLabel: false,
					tabBarActiveTintColor: theme.colors.primary,
					headerShown: false,
					// tabBarButton: HapticTab,
					sceneStyle: {
						backgroundColor: theme.colors.surfaceAlter
					}
				}}
			>
				<Tabs.Screen
					name='motivation'
					options={{
						title: t('screen.Motivation'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='allTasks'
					options={{
						title: t('screen.All Tasks'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='scheme'
					options={{
						title: t('screen.Scheme'),
						href: null,
						headerShown: true,
						header: (props) => <Header {...props} />
					}}
				/>
				<Tabs.Screen
					name='index'
					options={{
						title: t('screen.Today'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderDay {...props} />
					}}
				/>
				<Tabs.Screen
					name='calendar'
					options={{
						title: t('screen.Calendar'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderCalendar {...props} />
					}}
				/>
				<Tabs.Screen
					name='task'
					options={{
						title: t('screen.Task'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderTask {...props} />
					}}
				/>
				<Tabs.Screen
					name='progress'
					options={{
						title: t('screen.Progress'),
						href: null,
						headerShown: true,
						header: (props) => <HeaderTask {...props} />
					}}
				/>
			</Tabs>
		</>
	)
}
