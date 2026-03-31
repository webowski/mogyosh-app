import { commonStyles } from '@/shared/styles/common'
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderTask({
	options,
	navigation,
	route
}: HeaderProps) {
	return (
		<View style={commonStyles.header}>
			<Text style={commonStyles.headerSubtitle}>Здоровье • Тренировка</Text>
			<Text style={commonStyles.headerTitle}>Тяговые упражнения</Text>
		</View>
	)
}
