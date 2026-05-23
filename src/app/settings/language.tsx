import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useLangStore } from '@/shared/model/langStore'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

const languages = [
	{ code: 'en' as const, name: 'English' },
	{ code: 'es' as const, name: 'Español' },
	{ code: 'ja' as const, name: '日本語' },
	{ code: 'ru' as const, name: 'Русский' }
]

export default function LanguageScreen() {
	const { theme } = useUnistyles()
	const { language, setLanguage } = useLangStore()

	return (
		<>
			<ScrollBox scrollIndent>
				<View style={{ gap: 12 }}>
					{languages.map((lang) => (
						<Pressable
							key={lang.code}
							style={[
								styles.radioItem,
								{
									borderColor:
										language === lang.code
											? theme.colors.primary500
											: 'transparent'
								}
							]}
							onPress={() => setLanguage(lang.code)}
						>
							<Text style={styles.radioItem__text}>{lang.name}</Text>
							{language === lang.code && (
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
