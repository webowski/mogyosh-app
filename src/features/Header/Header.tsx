import { commonStyles } from '@/shared/styles/common'
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function Header({ options, navigation, route }: HeaderProps) {
	return (
		<View style={commonStyles.header}>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{options.title ?? route.name}
			</Text>
		</View>
	)
}
