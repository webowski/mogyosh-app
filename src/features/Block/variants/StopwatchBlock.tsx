import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import type { BlockProps } from '@/shared/domain/block'
import { useStopwatchStore } from '@/shared/model/stopwatch.store'
import { blockStyles } from '../style'

type StopwatchBlockProps = BlockProps & {}

export default function StopwatchBlock({ data }: StopwatchBlockProps) {
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
		<View style={blockStyles.Penoblok}>
			<View style={blockStyles.Stopwatch__body}>
				<Text style={blockStyles.Stopwatch__label}>{data.text_content}</Text>
				<Text style={blockStyles.Stopwatch__time}>{formatTime(displayMs)}</Text>
			</View>
			<View style={blockStyles.Stopwatch__actions}>
				<Pressable onPress={handleToggle} onLongPress={() => reset(data.id)}>
					<MaterialDesignIcons
						name={isRunning ? 'pause' : 'play'}
						size={24}
						color={theme.colors.primary}
					/>
				</Pressable>
			</View>
		</View>
	)
}

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
