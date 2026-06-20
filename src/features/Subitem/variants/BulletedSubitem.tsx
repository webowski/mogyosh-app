import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, Text, View } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import type { SubitemProps } from '../model/subitem.types'
import { SubitemInputRefsMap } from '../model/subitem.types'
import { useCreateSubitem } from '../model/useCreateSubitem'
import { useRemoveSubitem } from '../model/useRemoveSubitem'
import { useUpdateSubitem } from '../model/useUpdateSubitem'

type BulletedSubitemProps = SubitemProps & {
	depth: number
	inputRefs?: SubitemInputRefsMap
	onAddAfter?: () => void
}

export default function BulletedSubitem({
	data,
	depth,
	onCheckToggle,
	inputRefs,
	onAddAfter
}: BulletedSubitemProps) {
	const updateSubitem = useUpdateSubitem()
	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	// const newSubitemInputRef = useRef<
	// 	EnrichedMarkdownTextInputInstance | HTMLDivElement | null
	// >(null)

	const getOrCreateRef = () => {
		if (!inputRefs) return { current: null }
		if (!inputRefs.has(data.id)) {
			inputRefs.set(data.id, { current: null })
		}
		return inputRefs.get(data.id)!
	}

	const inputRef = getOrCreateRef()

	function getBullet(bulletDepth: number): string {
		const bullets = ['•', '◦', '▪', '•', '◦', '▪']
		return bullets[bulletDepth % bullets.length]
	}

	const updateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleChangeText = useCallback(
		(value: string) => {
			if (updateDebounceRef.current) clearTimeout(updateDebounceRef.current)
			updateDebounceRef.current = setTimeout(() => {
				updateSubitem.mutate({ id: data.id, info: value })
			}, 500)
		},
		// eslint-disable-next-line
		[data.id]
	)

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

	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? STYLE_VARS.checkedOpacity : 1, {
			duration: STYLE_VARS.duration.md
		})
	}))

	const focusNewInput = () => {
		const ref = inputRef.current
		if (!ref) return

		if (Platform.OS === 'web') {
			const element = ref as HTMLDivElement
			element.focus()
			const range = document.createRange()
			const selection = window.getSelection()
			range.selectNodeContents(element)
			range.collapse(false)
			selection?.removeAllRanges()
			selection?.addRange(range)
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).focus()
		}
	}

	const handleAddAfter = () => {
		if (onAddAfter) {
			onAddAfter()
			return
		}

		// Fallback: create directly if no onAddAfter provided (standalone usage)
		createSubitem.mutate(
			{
				info: '',
				task_id: data.task_id,
				parent_id: data.parent_id ?? null,
				type: 'ul'
			},
			{
				onSuccess: () => {
					setTimeout(focusNewInput, 50)
				}
			}
		)
	}

	return (
		<View>
			<View style={styles.container}>
				<Text style={{ marginRight: 6, fontSize: 20 }}>{getBullet(depth)}</Text>
				<Animated.Text style={[styles.text, textStyle]}>
					<MarkdownInput
						ref={inputRef}
						subitemText={data.info}
						onChangeText={handleChangeText}
						onChangeMarkdown={handleChangeText}
						onEnterPress={handleAddAfter}
						onBackspaceOnEmpty={() => {
							removeSubitem.mutate(data.id)
						}}
					/>
				</Animated.Text>
				{data.settings?.checkable && (
					<Checkbox checked={checked} onPress={handlePressCheckbox} />
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
		paddingVertical: 6
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))
