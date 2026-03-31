import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { useNavStore } from '@/shared/model/navStore'
import { useTimeStore } from '@/shared/model/timeStore'

import { formatTitleDate } from '@/shared/lib/time'
import WeekCalendar from '@/shared/ui/WeekCalendar'

import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { commonStyles } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderDay({ options, navigation, route }: HeaderProps) {
	const selectedDate = useTimeStore((state) => state.selectedDate)

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
		<View style={commonStyles.header}>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{titleDate}
			</Text>

			<WeekCalendar
				selectedDate={selectedDate}
				onSelectDate={(date: Date) => {
					useTimeStore.getState().setSelectedDate(date)
					useNavStore.getState().updateSwitchItems()
				}}
			/>
		</View>
	)
}
