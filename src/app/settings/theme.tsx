import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import {
	StyleSheet,
	UnistylesThemes,
	useUnistyles
} from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { useSettingsStore } from '@/services/settings/model/settingsStore'
import { themes } from '@/shared/styles/themes'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function ThemeScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()
	const { currentTheme, setCurrentTheme } = useSettingsStore()

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 12 }}>
					{Object.entries(themes).map(([key]) => (
						<Pressable
							key={key}
							style={[
								styles.radioItem,
								{
									borderColor:
										key === currentTheme ? theme.colors.primary : 'transparent'
								}
							]}
							onPress={() => setCurrentTheme(key as keyof UnistylesThemes)}
						>
							<Text style={styles.radioItem__text}>{t(`theme.${key}`)}</Text>
							{currentTheme === key && (
								<View style={styles.radioItem__indicator} />
							)}
						</Pressable>
					))}
				</View>
			</ScrollBox>

			<ActionsPanel>
				<Button size='round' onPress={() => router.back()}>
					<MaterialIcons
						name='arrow-back'
						size={28}
						color={theme.colors.buttonText}
					/>
				</Button>
			</ActionsPanel>
		</>
	)
}

const styles = StyleSheet.create((theme) => ({
	radioItem: {
		padding: 16,
		borderRadius: 12,
		backgroundColor: theme.colors.surface,
		borderWidth: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	radioItem__text: {
		fontSize: 16,
		color: theme.colors.major,
		fontWeight: '500'
	},
	radioItem__indicator: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: theme.colors.primary
	}
}))
