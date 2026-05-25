import { MaterialIcons } from '@expo/vector-icons'
import type { RefObject } from 'react'
import { useCallback, useRef } from 'react'
import { Platform, Pressable, View } from 'react-native'
import {
	EnrichedMarkdownTextInput,
	type EnrichedMarkdownTextInputInstance
} from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

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

	const focusItem = useCallback(
		(id: string) => {
			if (Platform.OS === 'web') {
				webInputRefs.current.get(id)?.focus()
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

	const removeItem = (index: number) => {
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
	}

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
									if (text === '') {
										event.preventDefault()
										removeItem(index)
									}
								}
							}}
							// @ts-ignore - web-only inline styles
							style={{
								flex: 1,
								fontSize: 15,
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
							onChangeMarkdown={(markdown) => updateItem(item.id, markdown)}
							placeholderTextColor={theme.colors.minor}
							// placeholder={index === 0 ? 'Список задач...' : ''}
							scrollEnabled={false}
							multiline
						/>
					)}
					{items.length > 1 && (
						<Pressable onPress={() => removeItem(index)} hitSlop={8}>
							<MaterialIcons
								name='close'
								size={18}
								color={theme.colors.minor}
							/>
						</Pressable>
					)}
					<Checkbox checked={false} style={{ marginTop: 3 }} />
				</View>
			))}
			<Pressable
				style={styles.addButton}
				onPress={() => addItemAfter(items.length - 1)}
			>
				<MaterialIcons name='add' size={18} color={theme.colors.minor} />
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
		color: theme.colors.major,
		paddingVertical: theme.spacing.xs,
		outline: 'none'
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: theme.spacing.xs,
		paddingLeft: 26, // align with input (18px checkbox + 8px gap)
		opacity: 0.5
	}
}))
