import { NavigationBar } from 'expo-navigation-bar'
import { Stack, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { useAuth } from '@/features/Auth/model/useAuth'
import Header from '@/features/Header/Header'
import { useNavStore } from '@/features/Navigation/model/navStore'
import { Providers } from '@/features/Providers'
import { commonStyles } from '@/shared/styles/common'
import { STATIC_COLORS } from '@/shared/styles/themes'
import { Button } from '@/shared/ui/Button'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
	duration: 500,
	fade: true
})

// export const unstable_settings = {
// 	anchor: '(tabs)'
// }

export default function RootLayout() {
	const { theme, rt } = useUnistyles()
	const { t } = useTranslation()
	const { isAuthenticated, isLoading, errorKind, refreshSession } = useAuth()

	const pathname = usePathname()
	const updateRoutes = useNavStore((state) => state.updateRoutes)

	useEffect(() => {
		updateRoutes(pathname)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	if (isLoading) {
		return (
			<View
				onLayout={() => SplashScreen.hideAsync()}
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: theme.colors.primary
				}}
			>
				<ActivityIndicator color={STATIC_COLORS.white} size={32} />
			</View>
		)
	}

	// Network / unknown error while checking session (before we know auth state)
	if (errorKind && !isAuthenticated) {
		return (
			<View
				onLayout={() => SplashScreen.hideAsync()}
				style={commonStyles.SystemContentMessage}
			>
				<Text style={commonStyles.SystemContentMessage__heading}>
					{t(`error.${errorKind}.title`)}
				</Text>
				<Text
					style={[
						commonStyles.SystemContentMessage__text,
						{ marginBottom: 26 }
					]}
				>
					{t(`error.${errorKind}.description`)}
				</Text>
				<Button onPress={refreshSession} variant='default' size='lg'>
					{t('error.Retry')}
				</Button>
			</View>
		)
	}

	return (
		<Providers>
			<StatusBar style={theme.statusBarColor} />

			{Platform.OS === 'android' && (
				<NavigationBar
					style={rt.themeName === 'light' ? 'dark' : 'light'}
					hidden={false}
				/>
			)}

			<Stack
				screenOptions={{
					contentStyle: {
						backgroundColor: theme.colors.surfaceDeep
					}
				}}
			>
				{/* Only for logged-in users */}
				<Stack.Protected guard={isAuthenticated}>
					<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
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
					<Stack.Screen name='settings' options={{ headerShown: false }} />
				</Stack.Protected>

				{/* Only for guests */}
				<Stack.Protected guard={!isAuthenticated}>
					<Stack.Screen name='(auth)/login' options={{ headerShown: false }} />
				</Stack.Protected>
			</Stack>
		</Providers>
	)
}
