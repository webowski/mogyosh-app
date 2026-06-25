import { MaterialIcons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { generateKeyBetween } from 'fractional-indexing'
import { View } from 'react-native'
import { KeyboardToolbar } from 'react-native-keyboard-controller'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { useTaskStore } from '@/shared/model/task.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'
import { useCreateSubitem } from './model/useCreateSubitem'
import { useRemoveSubitem } from './model/useRemoveSubitem'

export default function EditorToolbar() {
	const { theme } = useUnistyles()
	const queryClient = useQueryClient()

	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)

	const focusedSubitemId = useEditorToolbarStore(
		(state) => state.focusedSubitemId
	)

	const removeSubitem = useRemoveSubitem()
	const handleRemove = () => {
		if (!focusedSubitemId) return
		removeSubitem.mutate({ id: focusedSubitemId, taskId: selectedTaskId })
	}

	const pendingFocusId = useEditorToolbarStore((state) => state.pendingFocusId)
	const createSubitem = useCreateSubitem()
	const handleAddSubitem = () => {
		const existingSubitems =
			queryClient.getQueryData<SubitemEntity[]>(['subitems', selectedTaskId]) ??
			[]
		const lastSubitem = existingSubitems[existingSubitems.length - 1] ?? null
		const sort_order = generateKeyBetween(lastSubitem?.sort_order ?? null, null)

		const optimisticId = `optimistic-${Date.now()}` as SubitemId
		pendingFocusId.current = optimisticId

		createSubitem.mutate(
			{
				info: '',
				task_id: selectedTaskId,
				parent_id: null,
				type: 'ul',
				optimisticId,
				sort_order
			},
			{
				onSuccess: (newSubitem) => {
					pendingFocusId.current = newSubitem.id
				}
			}
		)
	}

	return (
		<KeyboardToolbar>
			<KeyboardToolbar.Background>
				<View
					style={{
						backgroundColor: theme.colors.surface,
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
						right: 0
					}}
				/>
			</KeyboardToolbar.Background>

			<KeyboardToolbar.Content style={{ padding: 8 }}>
				<View
					style={{
						padding: 8,
						// paddingHorizontal: STYLE_VARS.sidePadding,
						flexDirection: 'row',
						gap: 8
					}}
				>
					<Button variant='bare' onPress={handleAddSubitem}>
						<MaterialIcons name='add' size={24} />
					</Button>

					<Button variant='bare' onPress={() => {}}>
						<MaterialIcons name='swap-horiz' size={24} />
					</Button>

					<Button variant='bare' onPress={() => {}}>
						B
					</Button>

					<Button variant='bare' onPress={() => {}}>
						I
					</Button>

					<Button variant='bare' onPress={() => {}}>
						<MaterialIcons name='link' size={24} />
					</Button>

					<Button variant='bare' onPress={handleRemove}>
						<MaterialIcons name='delete' size={24} />
					</Button>
				</View>
			</KeyboardToolbar.Content>
		</KeyboardToolbar>
	)
}

{
	/*
	<KeyboardStickyView
		offset={{
			closed: 0,
			// closed: -STYLE_VARS.editorToolbarHeight,
			// opened: insets.bottom + 40
			// opened: 62
			// opened: -STYLE_VARS.editorToolbarHeight * 0.5
			opened: 0
		}}
	>
		<EditorPanel />
	</KeyboardStickyView>

<View
	style={{
		height: STYLE_VARS.editorToolbarHeight,
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: STYLE_VARS.sidePadding,
		backgroundColor: '#fff',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: '#ddd',
		gap: 6
	}}
>
</View> */
}

const styles = StyleSheet.create((theme, rt) => ({
	Toolbar__set: {
		paddingVertical: 8,
		paddingHorizontal: STYLE_VARS.sidePadding,
		flexDirection: 'row',
		gap: 8
	}
}))
