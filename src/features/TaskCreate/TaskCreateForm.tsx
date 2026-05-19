import { MaterialIcons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { z } from 'zod'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { useCreateTask } from '@/features/TaskList'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import { TodoListEditor } from './TodoListEditor'

const schema = z.object({
	title: z.string().min(1, 'Название обязательно').max(100)
})

type TaskFormData = z.infer<typeof schema>

interface Props {
	onClose: () => void
}

export function TaskCreateForm({ onClose }: Props) {
	const { theme } = useUnistyles()
	const createTask = useCreateTask()
	const setDraftTitle = useTaskStore((store) => store.setDraftTitle)
	const clearDraftTitle = useTaskStore((store) => store.clearDraftTitle)

	const [subtasks, setSubtasks] = useState<{ id: string; text: string }[]>([
		{ id: 'initial', text: '' }
	])

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting }
	} = useForm<TaskFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			title: ''
		}
	})

	const title = watch('title')

	useEffect(() => {
		setDraftTitle(title)
	}, [title, setDraftTitle])

	useEffect(() => {
		return () => {
			clearDraftTitle()
		}
	}, [clearDraftTitle])

	const onSubmit = async (data: TaskFormData) => {
		const parentTask = await createTask.mutateAsync({ info: data.title })

		const filledSubtasks = subtasks.filter((subtask) => subtask.text.trim())
		if (filledSubtasks.length > 0 && parentTask.id) {
			await Promise.all(
				filledSubtasks.map((subtask) =>
					createTask.mutateAsync({
						info: subtask.text,
						parent_id: parentTask.id
					})
				)
			)
		}

		onClose()
	}

	return (
		<>
			<ScrollView
				style={commonStyles.scrollBox}
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps='handled'
			>
				<View style={[commonStyles.mainArea, commonStyles.scrollIndent]}>
					<View style={styles.fieldGroup}>
						<Controller
							control={control}
							name='title'
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									style={[styles.input, errors.title && styles.input__error]}
									placeholder='Название задачи'
									placeholderTextColor={theme.colors.minor}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									returnKeyType='next'
									autoFocus
								/>
							)}
						/>
						{errors.title && (
							<Text style={styles.errorText}>{errors.title.message}</Text>
						)}
					</View>

					<View style={styles.fieldGroup}>
						<TodoListEditor items={subtasks} onChange={setSubtasks} />
					</View>
				</View>
			</ScrollView>

			<ActionsPanel>
				{/* <Button size='round' onPress={onClose}>
					<MaterialIcons
						name='arrow-back'
						size={28}
						color={theme.colors.buttonText}
					/>
				</Button> */}

				<Button
					size='round'
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting || createTask.isPending}
					style={{ marginLeft: 'auto' }}
				>
					<MaterialIcons
						name='check'
						size={28}
						color={theme.colors.buttonText}
					/>
				</Button>
			</ActionsPanel>
		</>
	)
}

const styles = StyleSheet.create((theme) => ({
	fieldGroup: {
		marginBottom: theme.spacing.md,
		gap: theme.spacing.xs
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		color: theme.colors.minor
	},
	input: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: STYLE_VARS.radius_sm,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		fontSize: 16,
		color: theme.colors.major
	},
	input__error: {
		borderColor: theme.colors.danger
	},
	input__multiline: {
		minHeight: 100,
		paddingTop: theme.spacing.sm
	},
	errorText: {
		fontSize: 12,
		color: theme.colors.danger
	}
}))
