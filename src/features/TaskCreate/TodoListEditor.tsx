import { MaterialIcons } from '@expo/vector-icons'
import { useRef } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

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
	const inputRefs = useRef<Record<string, TextInput | null>>({})

	const addItemAfter = (index: number) => {
		const newItem: TodoItem = { id: Date.now().toString(), text: '' }
		const next = [...items]
		next.splice(index + 1, 0, newItem)
		onChange(next)

		// Focus new item after state update
		setTimeout(() => {
			inputRefs.current[newItem.id]?.focus()
		}, 50)
	}

	const removeItem = (index: number) => {
		if (items.length <= 1) {
			// Keep at least one item, just clear it
			onChange([{ ...items[0], text: '' }])
			return
		}
		const next = items.filter((_, i) => i !== index)
		onChange(next)

		// Focus previous item
		const focusIndex = Math.max(0, index - 1)
		setTimeout(() => {
			inputRefs.current[next[focusIndex].id]?.focus()
		}, 50)
	}

	const updateItem = (id: string, text: string) => {
		onChange(items.map((item) => (item.id === id ? { ...item, text } : item)))
	}

	return (
		<View style={styles.container}>
			{items.map((item, index) => (
				<View key={item.id} style={styles.row}>
					<View style={styles.checkbox} />
					<TextInput
						ref={(ref) => {
							inputRefs.current[item.id] = ref
						}}
						style={styles.input}
						value={item.text}
						onChangeText={(text) => updateItem(item.id, text)}
						placeholderTextColor={theme.colors.minor}
						placeholder={index === 0 ? 'Список задач...' : ''}
						returnKeyType='next'
						onSubmitEditing={() => addItemAfter(index)}
						blurOnSubmit={false}
						onKeyPress={({ nativeEvent }) => {
							if (nativeEvent.key === 'Backspace' && item.text === '') {
								removeItem(index)
							}
						}}
					/>
					{items.length > 1 && (
						<Pressable onPress={() => removeItem(index)} hitSlop={8}>
							<MaterialIcons
								name='close'
								size={18}
								color={theme.colors.minor}
							/>
						</Pressable>
					)}
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
		alignItems: 'center',
		gap: theme.spacing.sm
	},
	checkbox: {
		width: 18,
		height: 18,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: theme.colors.border,
		backgroundColor: 'transparent'
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: theme.colors.major,
		paddingVertical: theme.spacing.xs
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: theme.spacing.xs,
		paddingLeft: 26, // align with input (18px checkbox + 8px gap)
		opacity: 0.5
	}
}))
