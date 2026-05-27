import { Stack, usePathname } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import Header from '@/features/Header/Header'
import { useNavStore } from '@/features/Navigation/model/navStore'
import { Providers } from '@/features/Providers'
import { login } from '@/shared/api/auth'

export const unstable_settings = {
	anchor: '(tabs)'
}

export default function RootLayout() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	const [isLoggedIn, setLoggedIn] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)

	const pathname = usePathname()
	const updateRoutes = useNavStore((state) => state.updateRoutes)

	useEffect(
		() => {
			updateRoutes(pathname)
		},
		// eslint-disable-next-line
		[pathname]
	)

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

	if (!isLoggedIn)
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator />
			</View>
		)

	return (
		<Providers>
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
		</Providers>
	)
}
