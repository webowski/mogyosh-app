import { TrueSheet } from '@lodev09/react-native-true-sheet'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Pressable,
	Text,
	TextInput,
	View
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
	getCategoryIdsWithSubcategories,
	useCategories,
	useCreateCategory,
	useDeleteCategory,
	useTaskListViewStore,
	useTasks,
	useUpdateCategory
} from '@/features/TaskList'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import { STYLE_VARS } from '@/shared/styles/common'
import { formStyles } from '@/shared/styles/form'
import { Button } from '@/shared/ui/Button'
import RadioButton from '@/shared/ui/RadioButton'

type SortOption = 'alphabetical' | 'created_at' | 'updated_at'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
	{ value: 'alphabetical', label: 'По алфавиту' },
	{ value: 'created_at', label: 'По дате создания' },
	{ value: 'updated_at', label: 'По дате изменения' }
]

export default function AllTasksScreen() {
	const { theme } = useUnistyles()
	const { t, i18n } = useTranslation()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryEntity | null>(null)
	const [isUncategorized, setIsUncategorized] = useState(false)

	const lifecycleFilter = useTaskListViewStore((state) => state.lifecycleFilter)
	const setLifecycleFilter = useTaskListViewStore(
		(state) => state.setLifecycleFilter
	)

	const sheetRef = useRef<TrueSheet>(null)

	const [sortOption, setSortOption] = useState<SortOption>('created_at')
	const sortSheetRef = useRef<TrueSheet>(null)

	const { data: categories } = useCategories()
	const createCategory = useCreateCategory()
	const [isCreatingCategory, setIsCreatingCategory] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const updateCategory = useUpdateCategory()
	const deleteCategory = useDeleteCategory()
	const [editingCategory, setEditingCategory] = useState<CategoryEntity | null>(
		null
	)
	const [editCategoryName, setEditCategoryName] = useState('')

	const {
		data: tasks,
		isLoading,
		error
	} = useTasks({
		lifecycle: lifecycleFilter,
		searchQuery: searchQuery.trim() || undefined,
		categoryId: isUncategorized
			? 'uncategorized'
			: selectedCategory && categories
				? getCategoryIdsWithSubcategories(selectedCategory.id, categories)
				: undefined
	})

	const pickerItems = useMemo(
		() => {
			const noCategory = {
				value: 'uncategorized',
				label: t('Uncategorized'),
				depth: 0
			}
			const allCategories = {
				value: null,
				label: t('All categories'),
				depth: 0
			}

			if (!categories || categories.length === 0) {
				return [allCategories, noCategory]
			}

			const visited = new Set<string>()
			const result: { value: string | null; label: string; depth: number }[] =
				[]

			const buildCategoriesTree = (parentId: string | null, depth: number) => {
				for (const category of categories) {
					if (category.parent_id !== parentId || visited.has(category.id)) {
						continue
					}
					visited.add(category.id)

					// const prefix = depth > 0 ? ' — '.repeat(depth) : ''
					result.push({
						value: category.id,
						label: category.name,
						depth
					})

					buildCategoriesTree(category.id, depth + 1)
				}
			}

			buildCategoriesTree(null, 0)

			return [allCategories, noCategory, ...result]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[categories, i18n.language]
	)

	const sortedTasks = useMemo(() => {
		if (!tasks) return tasks

		const tasksCopy = [...tasks]

		switch (sortOption) {
			case 'alphabetical':
				return tasksCopy.sort((taskA, taskB) =>
					taskA.title.localeCompare(taskB.title, i18n.language)
				)
			case 'created_at':
				return tasksCopy.sort(
					(taskA, taskB) =>
						new Date(taskB.created_at).getTime() -
						new Date(taskA.created_at).getTime()
				)
			case 'updated_at':
				return tasksCopy.sort((taskA, taskB) => {
					const dateA = new Date(taskA.updated_at ?? taskA.created_at).getTime()
					const dateB = new Date(taskB.updated_at ?? taskB.created_at).getTime()
					return dateB - dateA
				})
			default:
				return tasksCopy
		}
	}, [tasks, sortOption, i18n.language])

	const handleSortChange = (value: SortOption) => {
		setSortOption(value)
		sortSheetRef.current?.dismiss()
	}

	const handlePickerChange = (object: { item: { value: string | null } }) => {
		if (object.item.value === 'uncategorized') {
			setIsUncategorized(true)
			setSelectedCategory(null)
		} else {
			setIsUncategorized(false)
			const category =
				categories?.find((c) => c.id === object.item.value) ?? null
			setSelectedCategory(category)
		}
		sheetRef.current?.dismiss()
	}

	const handleCreateCategory = async () => {
		const name = newCategoryName.trim()
		if (!name) return

		try {
			const category = await createCategory.mutateAsync({ name })
			setIsUncategorized(false)
			setSelectedCategory(category)
			setNewCategoryName('')
			setIsCreatingCategory(false)
			sheetRef.current?.dismiss()
		} catch (error) {
			console.error('Failed to create category:', error)
		}
	}

	const handleUpdateCategory = async () => {
		const name = editCategoryName.trim()
		if (!name || !editingCategory) return

		try {
			await updateCategory.mutateAsync({ id: editingCategory.id, name })
			setEditingCategory(null)
			setEditCategoryName('')
		} catch (error) {
			console.error('Failed to update category:', error)
		}
	}

	const handleDeleteCategory = (category: CategoryEntity) => {
		Alert.alert(
			'Удалить категорию?',
			`Категория «${category.name}» будет удалена.`,
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: async () => {
						try {
							await deleteCategory.mutateAsync(category.id)
							if (selectedCategory?.id === category.id) {
								setSelectedCategory(null)
							}
						} catch (error) {
							console.error('Failed to delete category:', error)
						}
					}
				}
			]
		)
	}

	return (
		<>
			<View
				style={[
					{
						paddingHorizontal: STYLE_VARS.sidePadding,
						paddingTop: STYLE_VARS.sidePadding,
						paddingBottom: STYLE_VARS.sidePadding
					}
				]}
			>
				<View style={{ position: 'relative' }}>
					<MaterialDesignIcons
						name='magnify'
						size={20}
						color={theme.colors.mutedTextStrong}
						style={{
							position: 'absolute',
							left: 12,
							top: '50%',
							transform: [{ translateY: -9 }],
							zIndex: 1
						}}
					/>
					<TextInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder='Поиск'
						placeholderTextColor={theme.colors.mutedTextStrong}
						style={[formStyles.input, { paddingLeft: 38 }]}
					/>
				</View>
			</View>

			{lifecycleFilter === 'deleted' && (
				<View style={styles.DeletedBanner}>
					<Text style={styles.DeletedBanner__title}>Удалённые задачи</Text>
					<Pressable onPress={() => setLifecycleFilter('active')} hitSlop={8}>
						<Text style={styles.DeletedBanner__back}>Назад</Text>
					</Pressable>
				</View>
			)}

			<FlatList
				style={
					{
						// flex: 1
					}
				}
				contentContainerStyle={{
					// flexGrow: 1,
					paddingHorizontal: STYLE_VARS.sidePadding,
					// paddingTop: STYLE_VARS.sidePadding / 2,
					paddingBottom: STYLE_VARS.sidePadding / 2,
					gap: 4
				}}
				data={sortedTasks}
				keyExtractor={(item) => item.id}
				alwaysBounceVertical={false}
				bounces={false}
				contentInsetAdjustmentBehavior='never'
				overScrollMode='never'
				refreshing={false}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				renderItem={({ item }) => <TaskListItem data={item} />}
				ListEmptyComponent={
					isLoading ? (
						<ActivityIndicator />
					) : error ? (
						<Text>Ошибка загрузки</Text>
					) : (
						<Text>Нет задач, соответствующих выбранным параметрам</Text>
					)
				}
			/>

			<View style={styles.SubPanel}>
				<Button
					variant='pill'
					size='sm'
					widthMode='fitContent'
					style={{ width: 'auto' }}
					onPress={() => sortSheetRef.current?.present()}
				>
					{SORT_OPTIONS.find((option) => option.value === sortOption)?.label}
				</Button>

				<Button
					variant='pill'
					size='sm'
					widthMode='fitContent'
					style={{ width: 'auto' }}
					onPress={() => sheetRef.current?.present()}
					indicator={isUncategorized || selectedCategory !== null}
				>
					{t('filters.Categories')}
				</Button>
			</View>

			<TrueSheet
				ref={sheetRef}
				detents={['auto']}
				cornerRadius={STYLE_VARS.radius_2xl}
				backgroundColor={theme.colors.surface}
				grabberOptions={{ color: theme.colors.mutedTextStrong }}
				onDidDismiss={() => {
					setIsCreatingCategory(false)
					setNewCategoryName('')
					setEditingCategory(null)
					setEditCategoryName('')
				}}
			>
				<View
					style={{
						padding: STYLE_VARS.sidePadding_xl,
						gap: 12
					}}
				>
					{isCreatingCategory ? (
						<View style={{ gap: theme.spacing.md }}>
							<TextInput
								style={[
									formStyles.input,
									{ backgroundColor: theme.colors.surfaceAlter }
								]}
								placeholder='Название категории'
								placeholderTextColor={theme.colors.mutedTextStrong}
								value={newCategoryName}
								onChangeText={setNewCategoryName}
								autoFocus
								onSubmitEditing={handleCreateCategory}
								returnKeyType='done'
							/>
							<View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
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
					) : editingCategory ? (
						<View style={{ gap: theme.spacing.md }}>
							<TextInput
								style={[
									formStyles.input,
									{ backgroundColor: theme.colors.surfaceAlter }
								]}
								placeholder='Название категории'
								placeholderTextColor={theme.colors.mutedTextStrong}
								value={editCategoryName}
								onChangeText={setEditCategoryName}
								autoFocus
								onSubmitEditing={handleUpdateCategory}
								returnKeyType='done'
							/>
							<View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
								<Button
									variant='secondary'
									style={{ flex: 1 }}
									onPress={() => {
										setEditingCategory(null)
										setEditCategoryName('')
									}}
								>
									Отмена
								</Button>
								<Button
									style={{ flex: 1 }}
									onPress={handleUpdateCategory}
									disabled={
										!editCategoryName.trim() || updateCategory.isPending
									}
								>
									Сохранить
								</Button>
							</View>
						</View>
					) : (
						<>
							{pickerItems.map((item) => {
								const isSelected =
									item.value === 'uncategorized'
										? isUncategorized
										: item.value === null
											? !isUncategorized && selectedCategory === null
											: selectedCategory?.id === item.value

								const category =
									item.value && item.value !== 'uncategorized'
										? (categories?.find((c) => c.id === item.value) ?? null)
										: null

								return (
									<View
										key={String(item.value)}
										style={{
											flexDirection: 'row',
											alignItems: 'flex-start',
											marginLeft: 26 * item.depth
										}}
									>
										<RadioButton
											title={item.label}
											checked={isSelected}
											onPress={() => handlePickerChange({ item })}
											style={{ flex: 1 }}
										/>
										{category && (
											<View style={{ flexDirection: 'row', gap: 10 }}>
												<Pressable
													onPress={() => {
														setEditingCategory(category)
														setEditCategoryName(category.name)
													}}
													hitSlop={8}
												>
													<MaterialDesignIcons
														name='square-edit-outline'
														size={24}
														color={theme.colors.mutedTextStrong}
													/>
												</Pressable>
												<Pressable
													onPress={() => handleDeleteCategory(category)}
													hitSlop={8}
												>
													<MaterialDesignIcons
														name='trash-can-outline'
														size={24}
														color={theme.colors.mutedTextStrong}
													/>
												</Pressable>
											</View>
										)}
									</View>
								)
							})}
							<Button
								variant='secondary'
								style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }}
								onPress={() => setIsCreatingCategory(true)}
							>
								+ Создать категорию
							</Button>
						</>
					)}
				</View>
			</TrueSheet>

			<TrueSheet
				ref={sortSheetRef}
				detents={['auto']}
				cornerRadius={STYLE_VARS.radius_2xl}
				backgroundColor={theme.colors.surface}
				grabberOptions={{ color: theme.colors.mutedTextStrong }}
			>
				<View style={{ padding: STYLE_VARS.sidePadding_xl, gap: 12 }}>
					{SORT_OPTIONS.map((option) => (
						<RadioButton
							key={option.value}
							title={option.label}
							checked={sortOption === option.value}
							onPress={() => handleSortChange(option.value)}
						/>
					))}
				</View>
			</TrueSheet>
		</>
	)
}

const styles = StyleSheet.create((theme, rt) => ({
	DeletedBanner: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingBottom: 12
	},
	DeletedBanner__title: {
		fontSize: 16,
		fontWeight: '600',
		color: theme.colors.major
	},
	DeletedBanner__back: {
		fontSize: 15,
		color: theme.colors.primary
	},

	SubPanel: {
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 20,
		paddingBottom: 24 + STYLE_VARS.navPanelUnderlap,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 12
	}
}))
