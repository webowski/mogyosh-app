import { MaterialIcons } from '@expo/vector-icons'
import type { RefObject } from 'react'
import { useCallback, useRef } from 'react'
import { Platform, Pressable, View } from 'react-native'
import {
	EnrichedMarkdownTextInput,
	type EnrichedMarkdownTextInputInstance
} from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'

interface TodoItem {
	id: string
	text: string
}

interface Props {
	items: TodoItem[]
	onChange: (items: TodoItem[]) => void
}

export function TodoListEditor({ items, onChange }: Props) {
	const { theme } = useUnistyles()

	const inputRefs = useRef<
		Map<string, RefObject<EnrichedMarkdownTextInputInstance | null>>
	>(new Map())

	const webInputRefs = useRef<Map<string, HTMLDivElement>>(new Map())

	const getRefForItem = useCallback(
		(id: string): RefObject<EnrichedMarkdownTextInputInstance | null> => {
			if (!inputRefs.current.has(id)) {
				inputRefs.current.set(id, { current: null })
			}
			return inputRefs.current.get(id)!
		},
		[]
	)
	const moveCursorToEnd = (element: HTMLDivElement) => {
		const range = document.createRange()
		const selection = window.getSelection()
		range.selectNodeContents(element)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)
	}

	const focusItem = useCallback(
		(id: string) => {
			if (Platform.OS === 'web') {
				const element = webInputRefs.current.get(id)
				if (element) {
					element.focus()
					moveCursorToEnd(element)
				}
			} else {
				getRefForItem(id).current?.focus()
			}
		},
		[getRefForItem]
	)

	const addItemAfter = (index: number) => {
		const newItem: TodoItem = { id: Date.now().toString(), text: '' }
		const next = [...items]
		next.splice(index + 1, 0, newItem)
		onChange(next)

		setTimeout(() => {
			focusItem(newItem.id)
		}, 50)
	}

	const removeItem = useCallback(
		(index: number) => {
			if (items.length <= 1) {
				onChange([{ ...items[0], text: '' }])
				return
			}
			const next = items.filter((_, i) => i !== index)
			onChange(next)

			const focusIndex = Math.max(0, index - 1)
			setTimeout(() => {
				focusItem(next[focusIndex].id)
			}, 50)
		},
		[items, onChange, focusItem]
	)

	const updateItem = (id: string, text: string) => {
		const itemIndex = items.findIndex((item) => item.id === id)
		const updatedItems = items.map((item) =>
			item.id === id ? { ...item, text } : item
		)
		onChange(updatedItems)

		// Auto-remove empty item when field is cleared (except the last one)
		if (text === '' && items.length > 1) {
			removeItem(itemIndex)
		}
	}

	return (
		<View style={styles.container}>
			{items.map((item, index) => (
				<View key={item.id} style={styles.row}>
					{Platform.OS === 'web' ? (
						<div
							ref={(element) => {
								if (element) {
									webInputRefs.current.set(item.id, element)
								} else {
									webInputRefs.current.delete(item.id)
								}
							}}
							contentEditable
							suppressContentEditableWarning
							// data-placeholder={index === 0 ? 'Список задач...' : ''}
							onInput={(event) => {
								const text = (event.currentTarget as HTMLDivElement).innerText
								updateItem(item.id, text)
							}}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault()
									addItemAfter(index)
								} else if (event.key === 'Backspace') {
									const text = (event.currentTarget as HTMLDivElement).innerText
									if (text === '' || text === '\n') {
										event.preventDefault()
										removeItem(index)
									}
								}
							}}
							// @ts-ignore - web-only inline styles
							style={{
								flex: 1,
								fontSize: 16,
								fontWeight: 500,
								color: theme.colors.major,
								paddingTop: theme.spacing.xs,
								paddingBottom: theme.spacing.xs,
								outline: 'none',
								minHeight: 22,
								wordBreak: 'break-word'
							}}
						/>
					) : (
						<EnrichedMarkdownTextInput
							ref={getRefForItem(item.id)}
							style={styles.input}
							defaultValue={item.text}
							placeholderTextColor={theme.colors.minor}
							// placeholder={index === 0 ? 'Список задач...' : ''}
							scrollEnabled={false}
							multiline
							onChangeText={(text) => {
								if (text.includes('\n')) {
									getRefForItem(item.id).current?.setValue(
										items.find((i) => i.id === item.id)?.text ?? ''
									)
									addItemAfter(index)
								}
							}}
							onChangeMarkdown={(markdown) => {
								updateItem(item.id, markdown)
							}}
						/>
					)}
					{/* {items.length > 1 && (
						<Pressable onPress={() => removeItem(index)} hitSlop={8}>
							<MaterialIcons
								name='close'
								size={18}
								color={theme.colors.minor}
							/>
						</Pressable>
					)} */}
					<Checkbox checked={false} style={{ marginTop: 3 }} />
				</View>
			))}

			<Pressable
				style={styles.addButton}
				onPress={() => addItemAfter(items.length - 1)}
			>
				<MaterialIcons name='add' size={28} color={theme.colors.minor} />
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		gap: 2
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: theme.spacing.sm
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontWeight: '400',
		color: theme.colors.major,
		paddingVertical: theme.spacing.xs,
		outline: 'none'
	},
	addButton: {
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: theme.spacing.xs,
		backgroundColor: theme.colors.mutedLightFill,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_lg,
		borderBottomRightRadius: STYLE_VARS.radius_lg
	}
}))
