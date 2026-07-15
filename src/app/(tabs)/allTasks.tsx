import { TrueSheet } from '@lodev09/react-native-true-sheet'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TextInput,
	View
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
	getCategoryIdsWithSubcategories,
	useCategories,
	useCreateCategory,
	useTasks
} from '@/features/TaskList'
import TaskListItem from '@/features/TaskList/TaskListItem'
import type { CategoryEntity } from '@/shared/domain/task'
import { STYLE_VARS } from '@/shared/styles/common'
import { formStyles } from '@/shared/styles/form'
import { Button } from '@/shared/ui/Button'
import RadioButton from '@/shared/ui/RadioButton'

export default function AllTasksScreen() {
	const { theme } = useUnistyles()
	const { t, i18n } = useTranslation()

	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryEntity | null>(null)
	const [isUncategorized, setIsUncategorized] = useState(false)

	const sheetRef = useRef<TrueSheet>(null)

	const { data: categories } = useCategories()
	const createCategory = useCreateCategory()
	const [isCreatingCategory, setIsCreatingCategory] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')

	const {
		data: tasks,
		isLoading,
		error
	} = useTasks({
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
				data={tasks}
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
							{pickerItems.map((item) => {
								const isSelected =
									item.value === 'uncategorized'
										? isUncategorized
										: item.value === null
											? !isUncategorized && selectedCategory === null
											: selectedCategory?.id === item.value

								return (
									<RadioButton
										key={String(item.value)}
										title={item.label}
										checked={isSelected}
										onPress={() => handlePickerChange({ item })}
										style={{ marginLeft: 26 * item.depth }}
									/>
								)
							})}
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

const styles = StyleSheet.create((theme, rt) => ({
	SubPanel: {
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 20,
		paddingBottom: 24 + STYLE_VARS.navPanelUnderlap,
		flexDirection: 'row',
		justifyContent: 'center'
	}
}))
