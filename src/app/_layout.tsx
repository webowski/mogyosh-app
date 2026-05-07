import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'

import Header from '@/features/Header/Header'
import { runMigrations } from '@/services/database/migrate'

export const unstable_settings = {
	anchor: '(tabs)'
}

const queryClient = new QueryClient()

export default function RootLayout() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	useEffect(() => {
		runMigrations().catch((err) => {
			console.error('Migration error:', err)
		})
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaProvider>
					<StatusBar style={theme.statusBarColor} />
					<Stack
						screenOptions={{
							contentStyle: {
								backgroundColor: theme.colors.backgroundAlter
							}
						}}
					>
						<Stack.Screen
							name='(tabs)'
							options={{
								headerShown: false
							}}
						/>
						<Stack.Screen
							name='createTask'
							options={{
								title: t('screen.Create Task'),
								// headerShown: false,
								presentation: 'formSheet',
								sheetAllowedDetents: [0.9],
								sheetElevation: 1,
								sheetCornerRadius: 16
								// animation: 'slide_from_bottom'
							}}
						/>
						<Stack.Screen
							name='about'
							options={{
								title: t('screen.About'),
								headerShown: true,
								header: (props) => <Header {...props} />
							}}
						/>
						<Stack.Screen
							name='account'
							options={{
								title: t('screen.Account'),
								headerShown: true,
								header: (props) => <Header {...props} />
							}}
						/>
						<Stack.Screen
							name='settings'
							options={{
								headerShown: false
							}}
						/>
					</Stack>
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}
