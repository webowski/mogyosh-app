import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTaskById } from '@/features/TaskList/model'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles, styleVars } from '@/shared/styles/common'
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderTask({
	options,
	navigation,
	route
}: HeaderProps) {
	const insets = useSafeAreaInsets()

	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	if (isLoading) return <ActivityIndicator />

	return (
		<View
			style={[
				commonStyles.header,
				{
					paddingTop: insets.top + styleVars.insetPlus
				}
			]}
		>
			<Text style={commonStyles.headerSubtitle}>Здоровье • Тренировка</Text>
			<Text style={commonStyles.headerTitle}>{!error && data?.info}</Text>
		</View>
	)
}
