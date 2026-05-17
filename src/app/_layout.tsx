import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useUnistyles } from 'react-native-unistyles'

import Header from '@/features/Header/Header'
import { TaskCreateSheet } from '@/features/TaskCreate/TaskCreateSheet'
import { login } from '@/shared/api/auth'

export const unstable_settings = {
	anchor: '(tabs)'
}

const queryClient = new QueryClient()

export default function RootLayout() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	const [isLoggedIn, setLoggedIn] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)

	useEffect(
		function effectDatabaseRelated() {
			// // Тест 1: Простой публичный API
			// fetch('https://httpbin.org/get')
			// 	.then((r) => r.json())
			// 	.then((data) => console.log('HTTPBIN OK:', data.origin))
			// 	.catch((err) => console.log('HTTPBIN FAILED:', err.message))

			// // Тест 2: Прямо к Supabase REST (без auth)
			// fetch('https://oqlbysmlbmlqviljrayc.supabase.co/rest/v1/')
			// 	.then((r) => console.log('SUPABASE REST STATUS:', r.status))
			// 	.catch((err) => console.log('SUPABASE REST FAILED:', err.message))

			login()
				.then(() => setLoggedIn(true))
				.catch((err) => setLoginError(err.message))
		},
		//
		[]
	)

	if (loginError) return <Text>Ошибка логина: {loginError}</Text>
	if (!isLoggedIn) return <ActivityIndicator />

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaProvider>
					<ReducedMotionConfig mode={ReduceMotion.Never} />
					<BottomSheetModalProvider>
						<StatusBar style={theme.statusBarColor} />

						<TaskCreateSheet />

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
							{/* <Stack.Screen
								name='createTask'
								options={{
									title: t('screen.Create Task'),
									presentation: 'formSheet',
									sheetAllowedDetents: [0.9],
									sheetElevation: 1,
									sheetCornerRadius: 16
								}}
							/> */}
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
					</BottomSheetModalProvider>
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}
