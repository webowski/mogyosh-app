import { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack'
import { BottomTabHeaderProps } from 'expo-router/js-tabs'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTaskById } from '@/features/TaskList'
import { useCategoriesStore } from '@/features/TaskList/model/categoriesStore'
import { makeCategoryPath } from '@/features/TaskList/model/task.utils'
import { useTaskStore } from '@/shared/model/task.store'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderTask({
	options,
	navigation,
	route
}: HeaderProps) {
	const insets = useSafeAreaInsets()

	const categoryMap = useCategoriesStore((state) => state.entities)
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	// if (isLoading) return <ActivityIndicator />

	return (
		<View
			style={[
				commonStyles.header,
				{
					paddingTop: insets.top + STYLE_VARS.insetPlus
				}
			]}
		>
			<Text style={commonStyles.headerSubtitle}>
				{data?.category
					? makeCategoryPath(data?.category?.id, categoryMap)
					: ' '}
			</Text>
			<Text style={commonStyles.headerTitle}>{!error && data?.info}</Text>
		</View>
	)
}
