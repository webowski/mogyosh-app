import { Stack } from 'expo-router'

import Header from '@/features/Header/Header'
import { useTranslation } from 'react-i18next'

export default function SettingsLayout() {
	const { t } = useTranslation()

	return (
		<Stack
			screenOptions={{
				headerShown: false
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
