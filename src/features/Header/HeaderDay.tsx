import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarStore } from '@/shared/model/calendarStore'
import { useNavStore } from '@/shared/model/navStore'

import WeekCalendar from '@/features/Calendar/WeekCalendar'
import { formatTitleDate } from '@/shared/lib/time'

import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { commonStyles, styleVars } from '@/shared/styles/common'

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
					paddingTop: insets.top + styleVars.insetPlus
				}
			]}
		>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{titleDate}
			</Text>

			<WeekCalendar
				selectedDate={selectedDate}
				onSelectDate={(date: Date) => {
					useCalendarStore.getState().setSelectedDate(date)
					useNavStore.getState().updateSwitchItems()
				}}
			/>
		</View>
	)
}
