import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useTimerStore } from '@/shared/model/timer.store'
import CircleProgress, {
	type CircleProgressRef
} from '@/shared/ui/CircleProgress'
import type { SubitemProps } from '../model/subitem.types'
import { SUBITEM_VARS } from '../style'

type TimerSubitemProps = SubitemProps & {}

export default function TimerSubitem({ data }: TimerSubitemProps) {
	const { theme } = useUnistyles()

	const circleRef = useRef<CircleProgressRef>(null)

	const durationMs = data.settings.duration ?? 0
	const { start, pause, reset, getRemaining, entries } = useTimerStore()

	const entry = entries.get(data.id)
	const isRunning = entry?.isRunning ?? false
	const isFinished = (entry?.remainingMs ?? durationMs) === 0

	const [displayMs, setDisplayMs] = useState(() =>
		getRemaining(data.id, durationMs)
	)

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	useEffect(
		() => {
			if (isRunning) {
				intervalRef.current = setInterval(() => {
					const remaining = getRemaining(data.id, durationMs)
					setDisplayMs(remaining)
					// Auto-stop when finished
					if (remaining === 0) pause(data.id)
				}, 500)
			} else {
				if (intervalRef.current) clearInterval(intervalRef.current)
				setDisplayMs(getRemaining(data.id, durationMs))
			}
			return () => {
				if (intervalRef.current) clearInterval(intervalRef.current)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isRunning]
	)

	const handleReset = () => {
		circleRef.current?.snapTo(0)
		reset(data.id, durationMs)
	}

	const handleToggle = () => {
		if (durationMs === 0) return

		if (isFinished) {
			circleRef.current?.snapTo(0)
			reset(data.id, durationMs)
			start(data.id, durationMs)
			return
		}

		if (isRunning) {
			pause(data.id)
		} else {
			start(data.id, durationMs)
		}
	}
	const progress = durationMs > 0 ? 1 - displayMs / durationMs : 0
	const durationString = durationMs > 0 ? formatTime(displayMs) : '--:--:--'

	return (
		<View style={styles.Timer}>
			<View style={styles.Timer__body}>
				<Text style={styles.Timer__label}>{data.info}</Text>
				<View style={{}}>
					<Text style={styles.Timer__time}>{durationString}</Text>
				</View>
			</View>
			<View style={styles.Timer__actions}>
				<Pressable onPress={handleToggle} onLongPress={handleReset}>
					<CircleProgress ref={circleRef} size={40} progress={progress}>
						{isRunning ? (
							<MaterialIcons
								name='pause'
								size={22}
								color={theme.colors.primary}
							/>
						) : (
							<MaterialIcons
								name={isFinished ? 'check' : 'play-arrow'}
								size={24}
								color={theme.colors.primary}
							/>
						)}
					</CircleProgress>
				</Pressable>
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
		gap: 0,
		paddingHorizontal: 12,
		paddingVertical: 8
	},

	Timer__label: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.major
	},

	Timer__time: {
		fontSize: 17,
		fontWeight: '400',
		color: theme.colors.minor,
		fontVariantNumeric: 'tabular-nums'
	},

	Timer__actions: {
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

	return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':')
	// return [mins, secs].map((v) => String(v).padStart(2, '0')).join(':')
}
