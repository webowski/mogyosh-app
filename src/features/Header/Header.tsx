import { commonStyles, styleVars } from '@/shared/styles/common'
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function Header({ options, navigation, route }: HeaderProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			style={[
				commonStyles.header,
				{
					paddingTop: insets.top + styleVars.insetPlus
				}
			]}
		>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{options.title ?? route.name}
			</Text>
		</View>
	)
}
