import { Button, TextInput, View } from 'react-native'

import { useCreateTask } from './model'
import { useUIStore } from './model/ui.store'

export const TaskInput = () => {
	const { input, setInput, clearInput } = useUIStore()
	const { mutate, isPending } = useCreateTask()

	const handleAdd = () => {
		if (!input.trim()) return

		mutate(input, {
			onSuccess: () => {
				clearInput()
			}
		})
	}

	return (
		<View style={{ flexDirection: 'row', gap: 8 }}>
			<TextInput
				value={input}
				onChangeText={setInput}
				placeholder='Новая задача'
				style={{ flex: 1, borderWidth: 1, padding: 8 }}
			/>
			<Button title={isPending ? '...' : 'Добавить'} onPress={handleAdd} />
		</View>
	)
}
