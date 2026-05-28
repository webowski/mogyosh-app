import { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack'
import { BottomTabHeaderProps } from 'expo-router/js-tabs'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { commonStyles, STYLE_VARS } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function Header({ options, navigation, route }: HeaderProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			style={[
				commonStyles.header,
				{
					paddingTop: insets.top + STYLE_VARS.insetPlus
				}
			]}
		>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{options.title ?? route.name}
			</Text>
		</View>
	)
}
