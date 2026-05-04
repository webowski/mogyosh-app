import { useState } from 'react'
import { Pressable, ScrollView, Text } from 'react-native'

import { useCategories } from '@/features/TaskList/model'
import { CategoryEntity } from '@/shared/domain/task'
import { STYLE_VARS } from '@/shared/styles/common'
import { pillStyles } from './pillsStyles'

export default function Pills() {
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryEntity | null>(null)

	const { data: categories } = useCategories()

	const handlerFilterByCategory = (category: CategoryEntity | null) => {
		// Если нажали на уже выбранную категорию — сбрасываем фильтр
		if (selectedCategory?.id === category?.id) {
			setSelectedCategory(null)
		} else {
			setSelectedCategory(category)
		}
	}

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={[{ paddingBottom: 34, flexGrow: 0, flexBasis: 'auto' }]}
			// contentContainerStyle={styles.pills}
			contentContainerStyle={{
				paddingHorizontal: STYLE_VARS.sidePadding,
				gap: 6
			}}
		>
			<Pressable
				style={[
					pillStyles.pill,
					selectedCategory === null && pillStyles.pill__active
				]}
				onPress={() => handlerFilterByCategory(null)}
			>
				<Text
					style={[
						pillStyles.pill__text,
						selectedCategory === null && pillStyles.pill__text_active
					]}
				>
					Без категории
				</Text>
			</Pressable>
			{categories?.map((category) => (
				<Pressable
					key={category.id}
					style={[
						pillStyles.pill,
						selectedCategory?.id === category.id && pillStyles.pill__active
					]}
					onPress={() => handlerFilterByCategory(category)}
				>
					<Text
						style={[
							pillStyles.pill__text,
							selectedCategory?.id === category.id &&
								pillStyles.pill__text_active
						]}
					>
						{category.name}
					</Text>
				</Pressable>
			))}
		</ScrollView>
	)
}
