import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { router } from 'expo-router'
import { Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function AccountScreen() {
	const { theme } = useUnistyles()

	return (
		<>
			<ScrollBox scrollIndent>
				<View>
					<Text style={textStyles.heading5}>Account</Text>
				</View>
			</ScrollBox>

			<ActionsPanel>
				<Button round onPress={() => router.back()}>
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
