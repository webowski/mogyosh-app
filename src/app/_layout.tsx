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
import { useOnboardingStore } from '@/features/Onboarding/model/onboarding.store'
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
	const hasSeenOnboarding = useOnboardingStore(
		(state) => state.hasSeenOnboarding
	)

	const pathname = usePathname()
	const updateRoutes = useNavStore((state) => state.updateRoutes)

	useEffect(() => {
		updateRoutes(pathname)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	// Hide splash only after auth check is done
	useEffect(() => {
		if (!isLoading) {
			SplashScreen.hideAsync()
		}
	}, [isLoading])

	// Network / unknown error while checking session (before we know auth state)
	if (errorKind && !isAuthenticated && !isLoading) {
		return (
			<View style={commonStyles.SystemContentMessage}>
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

			{/* Always render Stack — required by Expo Router on first render */}
			<Stack
				screenOptions={{
					contentStyle: {
						backgroundColor: theme.colors.surfaceDeep
					}
				}}
			>
				{/* Onboarding: shown once, before everything else */}
				<Stack.Protected guard={!isLoading && !hasSeenOnboarding}>
					<Stack.Screen name='onboarding' options={{ headerShown: false }} />
				</Stack.Protected>

				{/* Only for logged-in users */}
				<Stack.Protected
					guard={!isLoading && hasSeenOnboarding && isAuthenticated}
				>
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
				<Stack.Protected
					guard={!isLoading && hasSeenOnboarding && !isAuthenticated}
				>
					<Stack.Screen name='(auth)/login' options={{ headerShown: false }} />
				</Stack.Protected>
			</Stack>

			{/* Optional overlay while auth is loading (splash already covers this) */}
			{isLoading && (
				<View
					pointerEvents='none'
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: theme.colors.primary
					}}
				>
					<ActivityIndicator color={STATIC_COLORS.white} size={32} />
				</View>
			)}
		</Providers>
	)
}
