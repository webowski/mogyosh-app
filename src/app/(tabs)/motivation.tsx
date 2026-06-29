import { useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator, Text, View } from 'react-native'
import { Pressable as GesturePressable } from 'react-native-gesture-handler'
import {
	KeyboardAwareScrollView,
	KeyboardController
} from 'react-native-keyboard-controller'

import { useMotivationSubitems } from '@/features/Motivation'
import { ChecklistItem } from '@/features/TaskList/ChecklistItem'
import { supabaseClient } from '@/shared/api/supabaseClient'
import { commonStyles, staticStyles, STYLE_VARS } from '@/shared/styles/common'

export default function MotivationScreen() {
	const queryClient = useQueryClient()
	const { data: subitems, isLoading, error } = useMotivationSubitems()

	const handleToggle = async (id: string, currentType: string) => {
		const newType = currentType === 'done' ? 'active' : 'done'

		try {
			const { error } = await supabaseClient
				.from('motivation_subitems')
				.update({ type: newType })
				.eq('id', id)

			if (error) throw error

			queryClient.invalidateQueries({ queryKey: ['motivation-subitems'] })
		} catch (err) {
			console.error('Failed to toggle motivation subitem:', err)
		}
	}

	// Show loading state
	if (isLoading)
		return (
			<View style={commonStyles.mainArea}>
				<ActivityIndicator />
			</View>
		)

	// Show error state
	if (error)
		return (
			<View style={commonStyles.mainArea}>
				<Text>
					Ошибка загрузки:{' '}
					{error instanceof Error ? error.message : 'Неизвестная ошибка'}
				</Text>
			</View>
		)

	return (
		<KeyboardAwareScrollView
			style={staticStyles.ScrollBox}
			overScrollMode='never'
			bottomOffset={STYLE_VARS.editorToolbarHeight * 1.25}
		>
			<GesturePressable
				style={staticStyles.ScrollBox__inner}
				onPress={() => KeyboardController.dismiss()}
				accessibilityRole={undefined}
			>
				{subitems?.map((subitem) => (
					<ChecklistItem
						key={subitem.id}
						checked={subitem.type === 'done'}
						text={subitem.info}
						onToggle={(_value) => handleToggle(subitem.id, subitem.type)}
					/>
				))}
			</GesturePressable>
		</KeyboardAwareScrollView>
	)
}
