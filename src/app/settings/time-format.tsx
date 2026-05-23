import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { useSettingsStore } from '@/services/settings/model/settingsStore'
import { HourFormat } from '@/shared/domain/time'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

const hourFormats: { value: HourFormat; labelKey: string }[] = [
	{ value: '12', labelKey: 'timeFormat.12' },
	{ value: '24', labelKey: 'timeFormat.24' }
]

export default function TimeFormatScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()
	const { hourFormat, setHourFormat } = useSettingsStore()

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 12 }}>
					{hourFormats.map((format) => (
						<Pressable
							key={format.value}
							style={[
								styles.radioItem,
								{
									borderColor:
										format.value === hourFormat
											? theme.colors.primary500
											: 'transparent'
								}
							]}
							onPress={() => setHourFormat(format.value)}
						>
							<Text style={styles.radioItem__text}>{t(format.labelKey)}</Text>
							{hourFormat === format.value && (
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
		backgroundColor: theme.colors.primary500
	}
}))
