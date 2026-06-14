import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import Checkbox from '@/shared/ui/Checkbox'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { SubitemProps } from '../model/subitem.types'

type CounterSubitemProps = SubitemProps & {
	// onExpandToggle: (expanded: boolean) => void
}

export default function CounterSubitem({
	data,
	onCheckToggle
}: CounterSubitemProps) {
	const [checked, setChecked] = useState(data.state === 'done')

	const animationProgress = useSharedValue(checked ? 1 : 0)

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const handlePressCheckbox = useCallback(
		() => {
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	return (
		<View style={styles.Timer}>
			<View style={styles.Timer__body}>
				<Text style={styles.Timer__label}>{data.info}</Text>
				<View style={{ flexDirection: 'row', gap: 4 }}>
					<Text style={styles.Timer__note}>50</Text>
					<Text style={styles.Timer__note}>кг</Text>
				</View>
			</View>
			<View style={styles.Timer__actions}>
				{data.settings?.checkable && (
					<Checkbox checked={checked} onPress={handlePressCheckbox} />
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Timer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: theme.colors.surface,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: theme.colors.borderLightest
	},

	Timer__body: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 6
	},

	Timer__label: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.major
	},
	Timer__note: {
		fontSize: 14,
		fontWeight: '400',
		color: theme.colors.minor
	},

	Timer__actions: {
		width: 58,
		padding: 8,
		borderLeftWidth: 1,
		borderColor: theme.colors.borderLightest,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
