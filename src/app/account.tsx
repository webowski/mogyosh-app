import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { useAuth } from '@/features/Auth/model/useAuth'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AccountScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()
	const { session, logout } = useAuth()
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await logout()
			// Stack.Protected will switch to login automatically
		} catch {
			setIsLoggingOut(false)
		}
	}

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 16 }}>
					<Text style={textStyles.heading5}>{t('screen.Account')}</Text>

					{session?.user?.email && (
						<Text style={{ color: theme.colors.major }}>
							{session.user.email}
						</Text>
					)}

					<Button
						onPress={handleLogout}
						variant='secondary'
						size='lg'
						widthMode='full'
						loading={isLoggingOut}
						disabled={isLoggingOut}
					>
						{t('screen.auth.Log out')}
					</Button>
				</View>
			</ScrollBox>

			<ActionsPanel>
				<Button
					round
					widthMode='equilateral'
					size='lg'
					onPress={() => router.back()}
				>
					<MaterialDesignIcons
						name='arrow-left'
						size={28}
						color={theme.colors.buttonText}
					/>
				</Button>
			</ActionsPanel>
		</>
	)
}
