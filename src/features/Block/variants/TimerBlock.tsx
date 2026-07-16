import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { formatTimerTime } from '@/shared/lib/time'
import { useTimerStore } from '@/shared/model/timer.store'
import CircleProgress, {
	type CircleProgressRef
} from '@/shared/ui/CircleProgress'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type TimerBlockProps = BlockProps & {
	inputRefs?: BlockInputRefsMap
}

export default function TimerBlock({
	data,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: TimerBlockProps) {
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
		blockType: 'timer'
	})

	const { theme } = useUnistyles()

	const circleRef = useRef<CircleProgressRef>(null)

	const durationMs = data.settings?.duration ?? 0
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
	const durationString =
		durationMs > 0 ? formatTimerTime(displayMs) : '--:--:--'

	return (
		<View style={blockStyles.Timer}>
			<View style={blockStyles.Timer__body}>
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
				{/* <Text style={styles.Timer__label}>{data.text_content}</Text> */}
				<Text style={blockStyles.Timer__time}>{durationString}</Text>
			</View>
			<View style={blockStyles.Timer__actions}>
				<Pressable onPress={handleToggle} onLongPress={handleReset}>
					<CircleProgress ref={circleRef} size={40} progress={progress}>
						{isRunning ? (
							<MaterialDesignIcons
								name='pause'
								size={22}
								color={theme.colors.primary}
							/>
						) : (
							<MaterialDesignIcons
								name={isFinished ? 'check' : 'play'}
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
