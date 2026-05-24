import { MaterialIcons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { z } from 'zod'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import {
	useCategories,
	useCreateCategory,
	useCreateTask
} from '@/features/TaskList'
import { useTaskStore } from '@/shared/model/taskStore'
import { STYLE_VARS } from '@/shared/styles/common'
import { formStyles } from '@/shared/styles/form'
import { Button } from '@/shared/ui/Button'
import RadioButton from '@/shared/ui/RadioButton'
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
	const { t } = useTranslation()

	const createTask = useCreateTask()
	const setDraftTitle = useTaskStore((store) => store.setDraftTitle)
	const clearDraftTitle = useTaskStore((store) => store.clearDraftTitle)

	const sheetRef = useRef<TrueSheet>(null)

	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null
	)
	const [isCreatingCategory, setIsCreatingCategory] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const { data: categories = [] } = useCategories()
	const createCategory = useCreateCategory()

	const categoryItems = useMemo(
		() => {
			const noCategory = {
				id: null,
				name: t('Uncategorized'),
				depth: 0
			}

			if (categories.length === 0) {
				return [noCategory]
			}

			const visited = new Set<string>()
			const result: { id: string | null; name: string; depth: number }[] = []

			const buildCategoriesTree = (parentId: string | null, depth: number) => {
				for (const category of categories) {
					if (category.parent_id !== parentId || visited.has(category.id)) {
						continue
					}
					visited.add(category.id)

					result.push({
						id: category.id,
						name: category.name,
						depth
					})

					buildCategoriesTree(category.id, depth + 1)
				}
			}

			buildCategoriesTree(null, 0)

			return [noCategory, ...result]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[categories]
	)

	const handleCreateCategory = async () => {
		const name = newCategoryName.trim()
		if (!name) return

		try {
			const category = await createCategory.mutateAsync({ name })
			setSelectedCategoryId(category.id)
			setNewCategoryName('')
			setIsCreatingCategory(false)
			sheetRef.current?.dismiss()
		} catch (error) {
			console.error('Failed to create category:', error)
		}
	}

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
					gap: 12
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

				<View
					style={{
						paddingHorizontal: STYLE_VARS.sidePadding,
						paddingTop: STYLE_VARS.sidePadding
					}}
				>
					<View style={[formStyles.formRow, formStyles.formRow_first]}>
						<Text style={{ marginBottom: 0 }}>Категория</Text>
						<Button
							variant='chip'
							size='chip'
							arrow
							onPress={() => sheetRef.current?.present()}
						>
							{selectedCategoryId
								? (categories.find((c) => c.id === selectedCategoryId)?.name ??
									t('Uncategorized'))
								: t('Uncategorized')}
						</Button>
					</View>
					<View style={[formStyles.formRow]}>
						<Text style={{ marginBottom: 0 }}>Метки</Text>
						<Button variant='chip' size='chip' arrow>
							Без метки
						</Button>
					</View>
					<View style={[formStyles.formRow]}>
						<Text style={{ marginBottom: 0 }}>Повтор</Text>
						<Button variant='chip' size='chip' arrow>
							Вт, Чт, Сб
						</Button>
					</View>
					<View style={[formStyles.formRow, formStyles.formRow_last]}>
						<Text style={{ marginBottom: 0 }}>Уведомление</Text>
						<Button variant='chip' size='chip' arrow>
							за 1 час
						</Button>
					</View>

					{/* <ScrollView
						overScrollMode='never'
						horizontal
						showsHorizontalScrollIndicator={false}
						style={{
							marginHorizontal: -1 * STYLE_VARS.sidePadding,
							paddingHorizontal: STYLE_VARS.sidePadding
						}}
					>
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
					</ScrollView> */}
				</View>

				<View style={styles.fieldGroup}>
					<TodoListEditor items={subtasks} onChange={setSubtasks} />
				</View>
			</ScrollView>

			<ActionsPanel style={{ paddingBottom: STYLE_VARS.navPanelUnderlap }}>
				{/* <Button size='round' variant='secondary' onPress={onClose}>
					<MaterialIcons name='clear' size={28} color={theme.colors.primary} />
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

			<TrueSheet
				ref={sheetRef}
				detents={['auto']}
				cornerRadius={STYLE_VARS.radius_2xl}
				backgroundColor={theme.colors.surface}
				grabberOptions={{ color: theme.colors.minor }}
				onDidDismiss={() => {
					setIsCreatingCategory(false)
					setNewCategoryName('')
				}}
			>
				<View style={{ padding: STYLE_VARS.sidePadding_xl, gap: 12 }}>
					{isCreatingCategory ? (
						<View style={{ gap: theme.spacing.md }}>
							<TextInput
								style={styles.input}
								placeholder='Название категории'
								placeholderTextColor={theme.colors.minor}
								value={newCategoryName}
								onChangeText={setNewCategoryName}
								autoFocus
								onSubmitEditing={handleCreateCategory}
								returnKeyType='done'
							/>
							<View
								style={{
									flexDirection: 'row',
									gap: theme.spacing.sm
								}}
							>
								<Button
									variant='secondary'
									style={{ flex: 1 }}
									onPress={() => {
										setIsCreatingCategory(false)
										setNewCategoryName('')
									}}
								>
									Отмена
								</Button>
								<Button
									style={{ flex: 1 }}
									onPress={handleCreateCategory}
									disabled={!newCategoryName.trim() || createCategory.isPending}
								>
									Создать
								</Button>
							</View>
						</View>
					) : (
						<>
							{categoryItems.map((item) => (
								<RadioButton
									key={String(item.id)}
									title={item.name}
									checked={selectedCategoryId === item.id}
									onPress={() => {
										setSelectedCategoryId(item.id)
										sheetRef.current?.dismiss()
									}}
									style={{ marginLeft: 26 * item.depth }}
								/>
							))}
							<Button
								variant='secondary'
								style={{
									marginTop: theme.spacing.sm,
									alignSelf: 'flex-start'
								}}
								onPress={() => setIsCreatingCategory(true)}
							>
								+ Создать категорию
							</Button>
						</>
					)}
				</View>
			</TrueSheet>
		</>
	)
}

const styles = StyleSheet.create((theme) => ({
	fieldGroup: {
		gap: theme.spacing.xs,
		paddingHorizontal: STYLE_VARS.sidePadding
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
	}
}))
