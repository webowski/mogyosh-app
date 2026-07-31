import { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack'
import { BottomTabHeaderProps } from 'expo-router/js-tabs'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { useTaskById } from '@/features/TaskList'
import { useCategoriesStore } from '@/features/TaskList/model/categoriesStore'
import { makeCategoryPath } from '@/features/TaskList/model/task.utils'
import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { formatNavDate } from '@/shared/lib/time'
import { useCalendarStore } from '@/shared/model/calendar.store'
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
	const selectedDate = useCalendarStore((state) => state.selectedDate)

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	const [titleDate, setTitleDate] = useState(formatNavDate(selectedDate))

	// if (isLoading) return <ActivityIndicator />

	useLanguageChange(() => {
		setTitleDate(formatNavDate(selectedDate))
	})

	useEffect(
		function effectOnDateChange() {
			setTitleDate(formatNavDate(selectedDate))
		},
		[selectedDate]
	)

	return (
		<View
			style={[
				commonStyles.Header,
				commonStyles.rowBetween,
				{
					paddingTop: insets.top + STYLE_VARS.insetPlus
				}
			]}
		>
			<View>
				<Text style={commonStyles.headerSubtitle}>
					{data?.category
						? makeCategoryPath(data?.category?.id, categoryMap)
						: ' '}
				</Text>
				<Text style={commonStyles.headerTitle}>{!error && data?.title}</Text>
			</View>
			<View style={styles.HeaderTask__dateBadge}>
				<Text style={styles.HeaderTask__dateBadgeText}>
					{titleDate}
					{/* {selectedDate.toLocaleDateString('ru-RU', {
						day: 'numeric',
						month: 'long'
					})} */}
				</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	HeaderTask__dateBadge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: theme.colors.surfaceDeep
	},
	HeaderTask__dateBadgeText: {
		fontSize: 12,
		fontWeight: 500,
		lineHeight: 12 * 1.2,
		color: theme.colors.mutedTextStrong
	}
}))
