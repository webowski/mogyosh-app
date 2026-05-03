import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useUnistyles } from 'react-native-unistyles'

import Header from '@/features/Header/Header'

export default function SettingsLayout() {
	const { t } = useTranslation()
	const { theme } = useUnistyles()

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: theme.colors.backgroundAlter
				}
			}}
		>
			<Stack.Screen
				name='index'
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
			<Stack.Screen
				name='time-format'
				options={{
					title: t('screen.Time format'),
					headerShown: true,
					header: (props) => <Header {...props} />
				}}
			/>
		</Stack>
	)
}
