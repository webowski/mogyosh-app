import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

export default function AboutScreen() {
	const { theme } = useUnistyles()

	return (
		<>
			<ScrollBox scrollIndent>
				<View>
					<Text style={textStyles.heading5}>About</Text>
				</View>
			</ScrollBox>

			<ActionsPanel>
				<Button round onPress={() => router.back()}>
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
