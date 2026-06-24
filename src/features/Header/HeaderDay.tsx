import { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack'
import { BottomTabHeaderProps } from 'expo-router/js-tabs'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarStore } from '@/shared/model/calendar.store'

import WeekCalendar from '@/features/Calendar/WeekCalendar'
import { formatTitleDate } from '@/shared/lib/time'

import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderDay({ options, navigation, route }: HeaderProps) {
	const insets = useSafeAreaInsets()
	const selectedDate = useCalendarStore((state) => state.selectedDate)

	const [titleDate, setTitleDate] = useState(formatTitleDate(selectedDate))

	useLanguageChange(() => {
		setTitleDate(formatTitleDate(selectedDate))
	})

	useEffect(
		function effectOnDateChange() {
			setTitleDate(formatTitleDate(selectedDate))
		},
		[selectedDate]
	)

	return (
		<View
			style={[
				commonStyles.header,
				{
					paddingTop: insets.top + STYLE_VARS.insetPlus - 6,
					paddingBottom: 6
				}
			]}
		>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{titleDate}
			</Text>

			<WeekCalendar />
		</View>
	)
}
