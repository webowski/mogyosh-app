import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, Text, View } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useCreateSubitem } from '../model/useCreateSubitem'
import { useUpdateSubitem } from '../model/useUpdateSubitem'

type OrderedSubitemProps = SubitemProps & {
	depth: number
	inputRefs?: SubitemInputRefsMap
}

export default function OrderedSubitem({
	data,
	depth,
	onCheckToggle,
	inputRefs,
	onAddAfter,
	onRemove,
	pendingFocusId
}: OrderedSubitemProps) {
	const updateSubitem = useUpdateSubitem()
	const createSubitem = useCreateSubitem()

	const setFocusedSubitemId = useEditorToolbarStore(
		(state) => state.setFocusedSubitemId
	)

	const getOrCreateRef = () => {
		if (!inputRefs) return { current: null }
		if (!inputRefs.has(data.id)) {
			inputRefs.set(data.id, { current: null })
		}
		return inputRefs.get(data.id)!
	}

	const inputRef = getOrCreateRef()

	const updateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const handleChangeText = useCallback(
		(value: string) => {
			if (updateDebounceRef.current) clearTimeout(updateDebounceRef.current)
			updateDebounceRef.current = setTimeout(() => {
				// console.log('[OrderedSubitem] handleChangeText:', value)
				updateSubitem.mutate({
					id: data.id,
					taskId: data.task_id,
					patch: { info: value }
				})
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
	const textStyle = useAnimatedStyle(() => ({
		opacity: withTiming(checked ? STYLE_VARS.checkedOpacity : 1, {
			duration: STYLE_VARS.duration.md
		})
	}))

	const handlePressCheckbox = useCallback(
		() => {
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	const handleFocus = () => setFocusedSubitemId(data.id)

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
				type: 'ol'
			}
			// {
			// 	onSuccess: () => {
			// 		setTimeout(focusNewInput, 50)
			// 	}
			// }
		)
		setTimeout(focusNewInput, 50)
	}

	useEffect(() => {
		if (pendingFocusId?.current === data.id) {
			pendingFocusId.current = null
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
	}, [data.id, pendingFocusId, inputRef])

	return (
		<View style={styles.Ordered}>
			<Text style={styles.Ordered__marker}>{getOrderedMarker(depth)}</Text>
			<Animated.Text style={[styles.text, textStyle]}>
				<MarkdownInput
					ref={inputRef}
					subitemText={data.info}
					onChangeMarkdown={handleChangeText}
					onEnterPress={handleAddAfter}
					onFocus={handleFocus}
					onBackspaceOnEmpty={() => {
						onRemove?.()
					}}
				/>
			</Animated.Text>
			{data.settings?.checkable && (
				<Checkbox checked={checked} onPress={handlePressCheckbox} />
			)}
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Ordered: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		paddingVertical: 4
	},
	Ordered__marker: {
		// marginTop: 12,
		// marginLeft: 2,
		// width: 6,
		// height: 6,
		// borderRadius: 3,
		// backgroundColor: theme.colors.major,
		marginLeft: 2,
		marginRight: 6,
		fontSize: 16,
		lineHeight: 20,
		fontWeight: 500
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: 500,
		color: theme.colors.major
	}
}))

function getOrderedMarker(depth: number): string {
	const markers = ['1.', 'a.', '.i', '1.', 'a.', 'i.']
	return markers[depth % markers.length]
}
