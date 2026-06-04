import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import CircleProgress from '@/shared/ui/CircleProgress'
import { SubitemProps } from '../model/subitem.types'

type CounterSubitemProps = SubitemProps & {
	// onExpandToggle: (expanded: boolean) => void
}

export default function TimerSubitem({ data }: CounterSubitemProps) {
	const durationString = data.settings.duration
		? formatDuration(data.settings.duration)
		: '0'

	return (
		<View style={styles.Timer}>
			<View style={styles.Timer__round}>
				<CircleProgress size={68} progress={0.5} value={durationString} />
			</View>
			<View>
				<Text style={styles.Timer__label}>{data.info}</Text>
				<Text style={styles.Timer__note}>1й подход</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Timer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	},
	Timer__round: {
		backgroundColor: theme.colors.surface,
		borderRadius: 100,
		padding: 6,
		boxShadow: '0 1px 3px rgba(0,0,0,.14)'
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
	}
}))

const formatDuration = (ms: number): string => {
	const totalSeconds = Math.floor(ms / 1000)
	const hrs = Math.floor(totalSeconds / 3600)
	const mins = Math.floor((totalSeconds % 3600) / 60)
	const secs = totalSeconds % 60

	return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':')
}
