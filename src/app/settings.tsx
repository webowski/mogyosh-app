import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { SettingsItem } from '@/features/Settings/SettingsItem'

import { WeekStartDayIndex } from '@/services/settings/domain'
import { useSettingsStore } from '@/services/settings/model/store'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'
import { Toggle } from '@/shared/ui/Toggle'
import { ToggleGroup } from '@/shared/ui/ToggleGroup'
import { useTranslation } from 'react-i18next'

export default function SettingsScreen() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()

	const weekStartDayIndex = useSettingsStore((state) => state.weekStartDayIndex)
	const setWeekStartDayIndex = useSettingsStore(
		(state) => state.setWeekStartDayIndex
	)
	const weekStartDaysData = useSettingsStore((state) => state.weekStartDaysData)

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 16 }}>
					<SettingsItem
						label={t('Language')}
						control={
							<Pressable onPress={() => router.push('/language')}>
								<Text
									style={{
										fontSize: 16,
										color: theme.colors.minor
									}}
								>
									{t('languageName')}
								</Text>
							</Pressable>
						}
					/>
					<SettingsItem
						label={t('date.Week start')}
						control={
							<ToggleGroup
								value={weekStartDayIndex}
								onChange={(value) => {
									setWeekStartDayIndex(Number(value) as WeekStartDayIndex)
								}}
								buttons={weekStartDaysData}
							/>
						}
					/>
					<SettingsItem label='Color theme' control={<Toggle />} />
					<SettingsItem label='Notifications' control={<Text>...</Text>} />
					<SettingsItem label='Privacy Policy' control={<Text>...</Text>} />
					<SettingsItem label='Apple Health' control={<Text>...</Text>} />
					<SettingsItem label='Auto-sync' control={<Toggle />} />

					<SettingsItem label='Mogyosh Premium' control={<Text>...</Text>} />

					<SettingsItem label='Rate app' control={<Text>...</Text>} />

					<SettingsItem label='Contact support' control={<Text>...</Text>} />
					<SettingsItem label='Terms of Service' control={<Text>...</Text>} />
					<SettingsItem
						label='Licenses / Copyright'
						control={<Text>...</Text>}
					/>
					<SettingsItem label='Version' control={<Text>1.0.0</Text>} />

					<SettingsItem label='Reset app data' control={<Text>...</Text>} />
					<SettingsItem label='Delete account' control={<Text>...</Text>} />
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
