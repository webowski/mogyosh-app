import { TrueSheet } from '@lodev09/react-native-true-sheet'
import WheelPicker, {
	withVirtualized
} from '@quidone/react-native-wheel-picker'
import { useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import { useTimePickerSheetStore } from '../model/timePickerSheet.store'

const VirtualizedWheelPicker = withVirtualized(WheelPicker)

const HOURS_DATA = Array.from({ length: 24 }, (_, index) => ({
	value: index,
	label: String(index).padStart(2, '0')
}))

const MINUTES_DATA = Array.from({ length: 60 }, (_, index) => ({
	value: index,
	label: String(index).padStart(2, '0')
}))

export function TimePickerSheet() {
	const { theme } = useUnistyles()
	const sheetRef = useRef<TrueSheet>(null)

	const isOpen = useTimePickerSheetStore((state) => state.isOpen)
	const payload = useTimePickerSheetStore((state) => state.payload)
	const close = useTimePickerSheetStore((state) => state.close)

	const [hours, setHours] = useState(0)
	const [minutes, setMinutes] = useState(0)

	useEffect(() => {
		if (isOpen && payload) {
			setHours(payload.hours)
			setMinutes(payload.minutes)
			sheetRef.current?.present()
		}
	}, [isOpen, payload])

	const handleHoursChanged = ({ item }: { item: { value: number } }) => {
		setHours(item.value)
		payload?.onChange(item.value, minutes)
	}

	const handleMinutesChanged = ({ item }: { item: { value: number } }) => {
		setMinutes(item.value)
		payload?.onChange(hours, item.value)
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
					<Text style={styles.TimePickerSheet__title}>{payload.title}</Text>
					<View style={styles.TimePickerSheet__row}>
						<VirtualizedWheelPicker
							data={HOURS_DATA}
							value={hours}
							onValueChanged={handleHoursChanged}
							enableScrollByTapOnItem={true}
							itemHeight={40}
							visibleItemCount={5}
							width='40%'
							itemTextStyle={{
								fontSize: 20,
								color: theme.colors.major
							}}
							overlayItemStyle={{
								backgroundColor: theme.colors.surfaceClosest
							}}
						/>
						<Text style={styles.TimePickerSheet__separator}>:</Text>
						<VirtualizedWheelPicker
							data={MINUTES_DATA}
							value={minutes}
							onValueChanged={handleMinutesChanged}
							enableScrollByTapOnItem={true}
							itemHeight={40}
							visibleItemCount={5}
							width='40%'
							itemTextStyle={{
								fontSize: 20,
								color: theme.colors.major
							}}
							overlayItemStyle={{
								backgroundColor: theme.colors.surfaceClosest
							}}
						/>
					</View>
				</>
			)}
		</TrueSheet>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	TimePickerSheet__title: {
		fontSize: 17 * rt.fontScale,
		fontWeight: '600',
		color: theme.colors.major,
		textAlign: 'center',
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 4,
		paddingBottom: 8
	},
	TimePickerSheet__row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		paddingBottom: 8
	},
	TimePickerSheet__separator: {
		fontSize: 24 * rt.fontScale,
		fontWeight: '600',
		color: theme.colors.major
	}
}))
