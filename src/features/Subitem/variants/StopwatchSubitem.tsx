import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useStopwatchStore } from '@/shared/model/stopwatch.store'
import CircleProgress from '@/shared/ui/CircleProgress'
import { SubitemProps } from '../model/subitem.types'

type StopwatchSubitemProps = SubitemProps & {}

export default function StopwatchSubitem({ data }: StopwatchSubitemProps) {
	const { theme } = useUnistyles()

	const { start, pause, reset, getElapsed, entries } = useStopwatchStore()
	const entry = entries.get(data.id)
	const isRunning = entry?.isRunning ?? false

	const [displayMs, setDisplayMs] = useState(() => getElapsed(data.id))

	// Tick every 500ms while running
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	useEffect(
		() => {
			if (isRunning) {
				intervalRef.current = setInterval(() => {
					setDisplayMs(getElapsed(data.id))
				}, 500)
			} else {
				if (intervalRef.current) clearInterval(intervalRef.current)
				setDisplayMs(getElapsed(data.id))
			}
			return () => {
				if (intervalRef.current) clearInterval(intervalRef.current)
			}
		},
		// eslint-disable-next-line
		[isRunning]
	)

	const handleToggle = () => {
		if (isRunning) {
			pause(data.id)
		} else {
			start(data.id)
		}
	}

	const durationString = formatTime(displayMs)

	return (
		<View style={styles.Stopwatch}>
			<Pressable
				style={styles.Stopwatch__round}
				onPress={handleToggle}
				onLongPress={() => reset(data.id)}
			>
				<CircleProgress size={68} progress={0} value={durationString}>
					{isRunning ? (
						<MaterialIcons
							name='pause'
							size={18}
							color={theme.colors.primary}
						/>
					) : (
						<MaterialIcons
							name='play-arrow'
							size={18}
							color={theme.colors.primary}
						/>
					)}
				</CircleProgress>
			</Pressable>
			<View>
				<Text style={styles.Stopwatch__label}>{data.info}</Text>
				<Text style={styles.Stopwatch__note}>Какой-то текст</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Stopwatch: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	},
	Stopwatch__round: {
		backgroundColor: theme.colors.surface,
		borderRadius: 100,
		padding: 6,
		boxShadow: '0 1px 3px rgba(0,0,0,.14)'
	},
	Stopwatch__label: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.major
	},
	Stopwatch__note: {
		fontSize: 14,
		fontWeight: '400',
		color: theme.colors.minor
	}
}))

const formatTime = (ms: number): string => {
	const totalSeconds = Math.floor(ms / 1000)
	const hrs = Math.floor(totalSeconds / 3600)
	const mins = Math.floor((totalSeconds % 3600) / 60)
	const secs = totalSeconds % 60

	return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':')
}
