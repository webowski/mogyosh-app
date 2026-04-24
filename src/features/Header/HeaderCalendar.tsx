import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarStore } from '@/shared/model/calendarStore'

import { formatCalendarTitle } from '@/shared/lib/time'

import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { commonStyles, styleVars } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderCalendar({
	options,
	navigation,
	route
}: HeaderProps) {
	const insets = useSafeAreaInsets()
	const selectedDate = useCalendarStore((state) => state.selectedDate)

	const [calendarTitle, setCalendarTitle] = useState(
		formatCalendarTitle(selectedDate)
	)

	useLanguageChange(() => {
		setCalendarTitle(formatCalendarTitle(selectedDate))
	})

	useEffect(
		function effectOnDateChange() {
			setCalendarTitle(formatCalendarTitle(selectedDate))
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
				{calendarTitle}
			</Text>
		</View>
	)
}
