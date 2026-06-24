import { NativeStackHeaderProps } from 'expo-router/build/react-navigation/native-stack'
import { BottomTabHeaderProps } from 'expo-router/js-tabs'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarStore } from '@/shared/model/calendar.store'

import { formatCalendarTitle } from '@/shared/lib/time'

import { useLanguageChange } from '@/shared/i18n/useLanguageChange'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'

type HeaderProps = BottomTabHeaderProps | NativeStackHeaderProps

export default function HeaderCalendar({
	options,
	navigation,
	route
}: HeaderProps) {
	const insets = useSafeAreaInsets()
	const selectedMonth = useCalendarStore((state) => state.selectedMonth)

	const [calendarTitle, setCalendarTitle] = useState(
		formatCalendarTitle(selectedMonth)
	)

	useLanguageChange(() => {
		setCalendarTitle(formatCalendarTitle(selectedMonth))
	})

	useEffect(
		function effectOnMonthChange() {
			setCalendarTitle(formatCalendarTitle(selectedMonth))
		},
		[selectedMonth]
	)

	return (
		<View
			style={[
				commonStyles.header,
				{
					paddingTop: insets.top + STYLE_VARS.insetPlus
				}
			]}
		>
			<Text style={[commonStyles.headerTitle, { textAlign: 'center' }]}>
				{calendarTitle}
			</Text>
		</View>
	)
}
