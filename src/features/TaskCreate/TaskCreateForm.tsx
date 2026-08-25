import { zodResolver } from '@hookform/resolvers/zod'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { generateNKeysBetween } from 'fractional-indexing'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { z } from 'zod'

import { ActionsPanel } from '@/features/ActionsPanel/ActionsPanel'
import { blockAPI } from '@/features/Block/repository/block.api'
import { useNavStore } from '@/features/Navigation/model/navStore'
import {
	useCategories,
	useCreateCategory,
	useCreateTask
} from '@/features/TaskList'
import type { BlockInsert } from '@/shared/domain/block'
import { useTaskStore } from '@/shared/model/task.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { formStyles } from '@/shared/styles/form'
import { textStyles } from '@/shared/styles/text'
import { Button } from '@/shared/ui/Button'
import RadioButton from '@/shared/ui/RadioButton'
import Textarea from '@/shared/ui/Textarea'
import { useRouter } from 'expo-router'

const schema = z.object({
	title: z.string().min(1, t('error.Enter the task title')).max(100)
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

	const router = useRouter()
	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipeRoute = useNavStore((store) => store.setSwipeRoute)

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

	const [blocksChecklist, setBlocksChecklist] = useState<BlockInsert[]>([])

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
			title: data.title,
			category_id: selectedCategoryId
		})

		const filledBlocksChecklist = blocksChecklist.filter((checklistItem) =>
			checklistItem.text_content.trim()
		)
		if (filledBlocksChecklist.length > 0 && parentTask.id) {
			// возможно надо оптимизировать чтобы создавать blocks пачкой а не по одному
			const positions = generateNKeysBetween(
				null,
				null,
				filledBlocksChecklist.length
			)
			// Direct API call — task is not open yet, no need for store/sync
			await Promise.all(
				filledBlocksChecklist.map((checklistItem, index) =>
					blockAPI.createBlock({
						text_content: checklistItem.text_content,
						task_id: parentTask.id,
						sort_order: positions[index]
					})
				)
			)
		}

		onClose()
		setSelectedTaskId(parentTask.id)
		setSwipeRoute('task')
		router.push('/task')
	}

	return (
		<>
			<ScrollView
				contentContainerStyle={styles.ScrollContent}
				keyboardShouldPersistTaps='handled'
				style={{ paddingTop: 24 }}
			>
				<View style={styles.fieldGroup}>
					<Controller
						control={control}
						name='title'
						render={({ field: { onChange, onBlur, value } }) => (
							<Textarea
								style={[styles.InputHeading]}
								placeholder={t('form.title')}
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								autoFocus
							/>
						)}
					/>
					{errors.title && (
						<Text style={styles.errorText}>{errors.title.message}</Text>
					)}
				</View>

				<View style={{}}>
					<View style={[formStyles.formRow, formStyles.formRow_first]}>
						<Text style={textStyles.label}>Категория</Text>
						<Button
							textStyle={{ fontWeight: 400 }}
							variant='chip'
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
						<Text style={textStyles.label}>Метки</Text>
						<Button textStyle={{ fontWeight: 400 }} variant='chip' arrow>
							Без метки
						</Button>
					</View>
					<View style={[formStyles.formRow]}>
						<Text style={textStyles.label}>Повтор</Text>
						<Button textStyle={{ fontWeight: 400 }} variant='chip' arrow>
							Вт, Чт, Сб
						</Button>
					</View>
					<View style={[formStyles.formRow, formStyles.formRow_last]}>
						<Text style={textStyles.label}>Уведомление</Text>
						<Button textStyle={{ fontWeight: 400 }} variant='chip' arrow>
							за 1 час
						</Button>
					</View>
				</View>
			</ScrollView>

			<ActionsPanel style={{ bottom: 0 }}>
				{/* <Button round variant='secondary' onPress={handleClearForm}>
					<MaterialIcons name='clear' size={28} color={theme.colors.primary} />
				</Button> */}

				<Button
					round
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting || createTask.isPending}
					loading={isSubmitting || createTask.isPending}
					style={{ marginLeft: 'auto' }}
				>
					<MaterialDesignIcons
						name='check-bold'
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
								style={[
									formStyles.input,
									{ backgroundColor: theme.colors.surfaceDeep }
								]}
								placeholder={t('placeholders.Category name')}
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
									{t('buttons.Cancel')}
								</Button>
								<Button
									style={{ flex: 1 }}
									onPress={handleCreateCategory}
									disabled={!newCategoryName.trim() || createCategory.isPending}
								>
									{t('buttons.Create')}
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
								{'+ ' + t('buttons.Create category')}
							</Button>
						</>
					)}
				</View>
			</TrueSheet>
		</>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	ScrollContent: {
		gap: 18,
		paddingTop: STYLE_VARS.sidePadding,
		paddingBottom: STYLE_VARS.sidePadding + STYLE_VARS.navPanelUnderlap + 12,
		paddingHorizontal: STYLE_VARS.sidePadding
	},

	fieldGroup: {
		gap: theme.spacing.xs
	},

	label: {
		fontSize: 14 * rt.fontScale,
		fontWeight: '500',
		color: theme.colors.minor
	},

	InputHeading: {
		fontSize: 24,
		lineHeight: 24 * 1.1,
		fontWeight: '700' as const,
		padding: 0,
		color: theme.colors.major,
		outline: 'none',
		backgroundColor: 'transparent',
		border: 'none'
	},

	InputHeading_error: {
		backgroundColor: theme.colors.dangerFill
	},

	input: {
		backgroundColor: theme.colors.surface,
		borderWidth: 1,
		borderColor: theme.colors.border,
		borderRadius: STYLE_VARS.radius_sm,
		paddingHorizontal: theme.spacing.md,
		paddingVertical: theme.spacing.sm,
		fontSize: 16,
		color: theme.colors.major,
		outline: 'none'
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
