import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text } from 'react-native'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'

import { login } from '@/shared/api/auth'

import Header from '@/features/Header/Header'

export const unstable_settings = {
	anchor: '(tabs)'
}

const queryClient = new QueryClient()

export default function RootLayout() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	const [isLoggedIn, setLoggedIn] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)

	useEffect(() => {
		login()
			.then(() => setLoggedIn(true))
			.catch((err) => setLoginError(err.message))
	}, [])

	if (loginError) return <Text>Ошибка логина: {loginError}</Text>
	if (!isLoggedIn) return <ActivityIndicator />

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaProvider>
					<StatusBar style={theme.statusBarColor} />
					<Stack
						screenOptions={{
							contentStyle: {
								backgroundColor: theme.colors.surfaceAlter
							}
						}}
					>
						<Stack.Screen
							name='(tabs)'
							options={{
								headerShown: false
								// contentStyle: {
								// 	backgroundColor: 'blue'
								// }
							}}
						/>
						<Stack.Screen
							name='createTask'
							options={{
								title: t('screen.Create Task'),
								// headerShown: false,
								presentation: 'modal',
								animation: 'slide_from_bottom'
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
								title: t('screen.Settings'),
								headerShown: true,
								header: (props) => <Header {...props} />
							}}
						/>
						<Stack.Screen
							name='language'
							options={{
								title: t('screen.Language'),
								headerShown: true,
								header: (props) => <Header {...props} />
							}}
						/>
						<Stack.Screen
							name='theme'
							options={{
								title: t('screen.Color theme'),
								headerShown: true,
								header: (props) => <Header {...props} />
							}}
						/>
					</Stack>
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}
