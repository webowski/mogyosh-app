import { MaterialIcons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { z } from 'zod'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { useCategories, useCreateTask } from '@/features/TaskList'
import { useTaskStore } from '@/shared/model/taskStore'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import { TodoListEditor } from './TodoListEditor'

const schema = z.object({
	title: z.string().min(1, 'Введите название задачи').max(100)
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

	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null
	)
	const { data: categories = [] } = useCategories()

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
		const parentTask = await createTask.mutateAsync({
			info: data.title,
			category_id: selectedCategoryId
		})

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
				style={{
					flex: 1
				}}
				contentContainerStyle={{
					flex: 1,
					paddingHorizontal: STYLE_VARS.sidePadding,
					paddingTop: STYLE_VARS.sidePadding,
					paddingBottom: STYLE_VARS.sidePadding + STYLE_VARS.navPanelUnderlap,
					gap: 6
				}}
				keyboardShouldPersistTaps='handled'
			>
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
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View style={styles.categoryList}>
							<Button
								variant='chip'
								size='chip'
								active={selectedCategoryId === null}
								onPress={() => setSelectedCategoryId(null)}
							>
								Без категории
							</Button>
							{categories.map((category) => (
								<Button
									key={category.id}
									variant='chip'
									size='chip'
									active={selectedCategoryId === category.id}
									onPress={() => setSelectedCategoryId(category.id)}
								>
									{category.name}
								</Button>
							))}
						</View>
					</ScrollView>
				</View>

				<View style={styles.fieldGroup}>
					<TodoListEditor items={subtasks} onChange={setSubtasks} />
				</View>
			</ScrollView>

			<ActionsPanel style={{ paddingBottom: STYLE_VARS.navPanelUnderlap }}>
				<Button size='round' variant='secondary' onPress={onClose}>
					<MaterialIcons name='clear' size={28} color={theme.colors.primary} />
				</Button>

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

	categoryList: {
		flexDirection: 'row',
		gap: theme.spacing.xs,
		paddingVertical: theme.spacing.xs
	},
	categoryChip: {
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.xs,
		borderRadius: 100,
		borderWidth: 1,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surface
	},
	categoryChip__active: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primary
	},
	categoryChip__text: {
		fontSize: 14,
		color: theme.colors.major
	},
	categoryChip__textActive: {
		color: theme.colors.buttonText
	}
}))
