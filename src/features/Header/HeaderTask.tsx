import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTaskById } from '@/features/TaskList'
import { useCategoriesStore } from '@/features/TaskList/model/categoriesStore'
import { makeCategoryPath } from '@/features/TaskList/model/task.utils'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderTask({
	options,
	navigation,
	route
}: HeaderProps) {
	const insets = useSafeAreaInsets()
	const { t } = useTranslation()
	const { mode } = useLocalSearchParams<{ mode?: string }>()
	const isCreateMode = mode === 'create'

	const categoryMap = useCategoriesStore((state) => state.entities)
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	if (isLoading) return <ActivityIndicator />

	if (isCreateMode) {
		return (
			<View
				style={[
					commonStyles.header,
					{
						paddingTop: insets.top + STYLE_VARS.insetPlus
					}
				]}
			>
				<Text style={commonStyles.headerTitle}>{t('screen.Create Task')}</Text>
			</View>
		)
	}

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
				{data?.category && makeCategoryPath(data?.category?.id, categoryMap)}
			</Text>
			<Text style={commonStyles.headerTitle}>{!error && data?.info}</Text>
		</View>
	)
}
