import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useStopwatchStore } from '@/shared/model/stopwatch.store'
import type { SubitemProps } from '../model/subitem.types'
import { SUBITEM_VARS } from '../style'

type StopwatchSubitemProps = SubitemProps & {}

export default function StopwatchSubitem({ data }: StopwatchSubitemProps) {
	const { theme } = useUnistyles()

	const { start, pause, reset, getElapsed, entries } = useStopwatchStore()

	const entry = entries.get(data.id)
	const isRunning = entry?.isRunning ?? false

	const [displayMs, setDisplayMs] = useState(() => getElapsed(data.id))

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	useEffect(
		() => {
			if (isRunning) {
				intervalRef.current = setInterval(() => {
					setDisplayMs(getElapsed(data.id))
				}, 100)
			} else {
				if (intervalRef.current) clearInterval(intervalRef.current)
				setDisplayMs(getElapsed(data.id))
			}
			return () => {
				if (intervalRef.current) clearInterval(intervalRef.current)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isRunning]
	)

	const handleToggle = () => {
		if (isRunning) {
			pause(data.id)
		} else {
			start(data.id)
		}
	}

	return (
		<View style={styles.Stopwatch}>
			<View style={styles.Stopwatch__body}>
				<Text style={styles.Stopwatch__label}>{data.info}</Text>
				<Text style={styles.Stopwatch__time}>{formatTime(displayMs)}</Text>
			</View>
			<View style={styles.Stopwatch__actions}>
				<Pressable onPress={handleToggle} onLongPress={() => reset(data.id)}>
					<MaterialIcons
						name={isRunning ? 'pause' : 'play-arrow'}
						size={24}
						color={theme.colors.primary}
					/>
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Stopwatch: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: theme.colors.surface,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: theme.colors.borderLightest
	},

	Stopwatch__body: {
		flex: 1,
		gap: 0,
		paddingHorizontal: 12,
		paddingVertical: 8
	},

	Stopwatch__label: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.major
	},

	Stopwatch__time: {
		fontSize: 17,
		fontWeight: '400',
		color: theme.colors.minor,
		fontVariantNumeric: 'tabular-nums'
	},

	Stopwatch__actions: {
		width: SUBITEM_VARS.actionWidth,
		padding: 8,
		borderLeftWidth: 1,
		borderColor: theme.colors.borderLightest,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch'
	}
}))

const formatTime = (ms: number): string => {
	const totalSeconds = Math.floor(ms / 1000)
	const hrs = Math.floor(totalSeconds / 3600)
	const mins = Math.floor((totalSeconds % 3600) / 60)
	const secs = totalSeconds % 60
	const tenths = Math.floor((ms % 1000) / 100)

	return (
		[hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':') +
		'.' +
		tenths
	)
}
