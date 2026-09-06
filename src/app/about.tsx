import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AboutScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	const appVersion = Constants.expoConfig?.version ?? '1.0.0'

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 22 }}>
					<View>
						<Text
							style={[
								textStyles.heading2,
								{ marginBottom: 4, color: theme.colors.major }
							]}
						>
							{t('screen.about.App name')}
						</Text>
						<Text style={[textStyles.p]}>{t('screen.about.Description')}</Text>
					</View>

					<View>
						<Text style={[textStyles.heading5, { marginBottom: 2 }]}>
							{t('screen.about.App version')}
						</Text>
						<Text style={[textStyles.p, { color: theme.colors.major }]}>
							{appVersion}
						</Text>
					</View>

					<View>
						<Text style={textStyles.p}>Политика конфиденциальности →</Text>
						<Text style={textStyles.p}>Условия использования →</Text>
						<Text style={textStyles.p}>Лицензии open-source →</Text>
					</View>

					<Text
						style={[
							textStyles.text_sm,
							{ color: theme.colors.mutedText, marginTop: 8 }
						]}
					>
						{t('screen.about.Copyright')}
					</Text>
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
