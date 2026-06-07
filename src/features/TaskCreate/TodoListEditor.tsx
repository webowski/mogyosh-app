import { MaterialIcons } from '@expo/vector-icons'
import { useRef } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { type EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { TodoItem } from './create.types'
import { SubitemMarkdownInput } from './SubitemMarkdownInput'

interface TodoListEditorProps {
	items: TodoItem[]
	onChange: (items: TodoItem[]) => void
}

export function TodoListEditor({ items, onChange }: TodoListEditorProps) {
	const { theme } = useUnistyles()

	const inputRefs = useRef<
		Map<
			string,
			React.RefObject<EnrichedMarkdownTextInputInstance | HTMLDivElement | null>
		>
	>(new Map())

	const getRefForItem = (id: string) => {
		if (!inputRefs.current.has(id)) {
			inputRefs.current.set(id, { current: null })
		}
		return inputRefs.current.get(id)!
	}

	const moveCursorToEnd = (element: HTMLDivElement) => {
		const range = document.createRange()
		const selection = window.getSelection()
		range.selectNodeContents(element)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)
	}

	const focusItem = (id: string) => {
		const ref = inputRefs.current.get(id)?.current
		if (!ref) return

		if (Platform.OS === 'web') {
			const element = ref as HTMLDivElement
			element.focus()
			moveCursorToEnd(element)
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).focus()
		}
	}

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
					<SubitemMarkdownInput
						ref={getRefForItem(item.id)}
						itemText={item.text}
						onChangeText={(text) => updateItem(item.id, text)}
						onChangeMarkdown={(markdown) => updateItem(item.id, markdown)}
						onEnterPress={() => addItemAfter(index)}
						onBackspaceOnEmpty={() => removeItem(index)}
					/>
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
