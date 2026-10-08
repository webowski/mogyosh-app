import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { DatePicker } from '@quidone/react-native-wheel-picker'
import { useEffect, useRef, useState } from 'react'
import { Text } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import { useDatePickerSheetStore } from '../model/datePickerSheet.store'

const formatDateString = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const getDefaultDate = (): string => formatDateString(new Date())

export function DatePickerSheet() {
	const { theme } = useUnistyles()
	const sheetRef = useRef<TrueSheet>(null)

	const isOpen = useDatePickerSheetStore((state) => state.isOpen)
	const payload = useDatePickerSheetStore((state) => state.payload)
	const close = useDatePickerSheetStore((state) => state.close)

	const [date, setDate] = useState(getDefaultDate())

	useEffect(() => {
		if (isOpen && payload) {
			setDate(payload.date || getDefaultDate())
			sheetRef.current?.present()
		}
	}, [isOpen, payload])

	const handleDateChanged = ({ date: nextDate }: { date: string }) => {
		setDate(nextDate)
		payload?.onChange(nextDate)
	}

	return (
		<TrueSheet
			ref={sheetRef}
			detents={['auto']}
			cornerRadius={STYLE_VARS.radius_2xl}
			backgroundColor={theme.colors.surfaceDeep}
			grabberOptions={{ color: theme.colors.minor }}
			onDidDismiss={close}
		>
			{payload && (
				<>
					<Text style={styles.DatePickerSheet__title}>{payload.title}</Text>
					<DatePicker
						date={date}
						onDateChanged={handleDateChanged}
						locale='ru'
						itemHeight={40}
						visibleItemCount={5}
						enableScrollByTapOnItem={true}
						itemTextStyle={{
							fontSize: 18,
							color: theme.colors.major
						}}
						overlayItemStyle={{
							backgroundColor: theme.colors.surfaceClosest
						}}
					/>
				</>
			)}
		</TrueSheet>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	DatePickerSheet__title: {
		fontSize: 17 * rt.fontScale,
		fontWeight: '600',
		color: theme.colors.major,
		textAlign: 'center',
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 4,
		paddingBottom: 8
	}
}))
