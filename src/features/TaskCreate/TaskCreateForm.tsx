import { MaterialIcons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { z } from 'zod'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { useCreateTask } from '@/features/TaskList'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'

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

	const [subtasks, setSubtasks] = useState<string[]>([])
	const [subtaskInput, setSubtaskInput] = useState('')

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

	const handleAddSubtask = () => {
		const trimmed = subtaskInput.trim()
		if (!trimmed) return

		setSubtasks((prev) => [...prev, trimmed])
		setSubtaskInput('')
	}

	const handleRemoveSubtask = (index: number) => {
		setSubtasks((prev) => prev.filter((_, i) => i !== index))
	}

	const onSubmit = async (data: TaskFormData) => {
		const parentTask = await createTask.mutateAsync({ info: data.title })

		if (subtasks.length > 0 && parentTask.id) {
			await Promise.all(
				subtasks.map((subtaskTitle) =>
					createTask.mutateAsync({
						info: subtaskTitle,
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
						{subtasks.map((subtask, index) => (
							<View key={`${subtask}-${index}`} style={styles.subtaskRow}>
								<View style={styles.subtaskCheckbox} />
								<Text style={styles.subtaskText} numberOfLines={1}>
									{subtask}
								</Text>
								<Pressable
									onPress={() => handleRemoveSubtask(index)}
									hitSlop={8}
								>
									<MaterialIcons
										name='close'
										size={20}
										color={theme.colors.minor}
									/>
								</Pressable>
							</View>
						))}
						<View style={styles.subtaskInputRow}>
							<View style={styles.subtaskCheckbox} />
							<TextInput
								style={styles.subtaskInput}
								placeholder='Добавить подзадачу'
								placeholderTextColor={theme.colors.minor}
								value={subtaskInput}
								onChangeText={setSubtaskInput}
								onSubmitEditing={handleAddSubtask}
								returnKeyType='done'
							/>
							<Pressable onPress={handleAddSubtask} hitSlop={8}>
								<MaterialIcons
									name='add'
									size={22}
									color={theme.colors.primary}
								/>
							</Pressable>
						</View>
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
	},
	subtaskRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.xs
	},
	subtaskInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.xs
	},
	subtaskCheckbox: {
		width: 18,
		height: 18,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: theme.colors.border,
		backgroundColor: 'transparent'
	},
	subtaskText: {
		flex: 1,
		fontSize: 15,
		color: theme.colors.major
	},
	subtaskInput: {
		flex: 1,
		fontSize: 15,
		color: theme.colors.major,
		paddingVertical: 0
	}
}))
