import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { formatStopwatchTime } from '@/shared/lib/time'
import { useStopwatchStore } from '@/shared/model/stopwatch.store'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type StopwatchBlockProps = BlockProps & {
	inputRefs?: BlockInputRefsMap
}

export default function StopwatchBlock({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: StopwatchBlockProps) {
	const {
		inputRef,
		checked,
		checkedStyle,
		handleChangeText,
		handlePressCheckbox,
		handleFocus,
		handleAddAfter
	} = useBlockLogic({
		data,
		onCheckToggle,
		inputRefs,
		onAddAfter,
		pendingFocusId,
		blockType: 'stopwatch'
	})

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

	const handleReset = () => {
		// circleRef.current?.snapTo(0)
		// reset(data.id, durationMs)
	}

	return (
		<View style={blockStyles.Penoblok}>
			<View style={blockStyles.Stopwatch__body}>
				<MarkdownInput
					ref={inputRef}
					blockText={data.text_content}
					style={[{ flex: 1 }, checkedStyle]}
					textStyle={blockStyles.text}
					onChangeMarkdown={handleChangeText}
					onEnterPress={handleAddAfter}
					onFocus={handleFocus}
					onBackspaceOnEmpty={() => {
						onRemove?.()
					}}
				/>
				<Text style={blockStyles.Stopwatch__time}>
					{formatStopwatchTime(displayMs)}
				</Text>
			</View>
			<View style={blockStyles.Stopwatch__actions}>
				<Pressable onPress={handleToggle} onLongPress={() => reset(data.id)}>
					{isRunning ? (
						<MaterialDesignIcons
							name='pause'
							size={22}
							color={theme.colors.primary}
						/>
					) : (
						<MaterialDesignIcons
							name='play'
							size={22}
							color={theme.colors.primary}
						/>
					)}
				</Pressable>
			</View>
		</View>
	)
}
