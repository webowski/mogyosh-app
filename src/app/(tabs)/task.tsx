import { MaterialIcons } from '@expo/vector-icons'
import { useRef } from 'react'
import {
	ActivityIndicator,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
	useCreateSubitem,
	useRemoveSubitem,
	useSubitems
} from '@/features/Subitem'
import type { SubitemInputRefsMap } from '@/features/Subitem/model/subitem.types'
import { buildSubitemTree } from '@/features/Subitem/model/subitem.utils'
import SubitemNode from '@/features/Subitem/SubitemNode'
import { useTaskById } from '@/features/TaskList'
import { SubitemId } from '@/shared/domain/ids'
import { useTaskStore } from '@/shared/model/taskStore'
import { commonStyles, STYLE_VARS } from '@/shared/styles/common'
import ScrollBox from '@/shared/ui/ScrollBox'

export default function TaskScreen() {
	const { theme } = useUnistyles()
	const selectedTaskId = useTaskStore((state) => state.selectedTaskId)
	const inputRefs = useRef<SubitemInputRefsMap>(new Map())

	const pendingFocusId = useRef<SubitemId | null>(null)
	// const [focusTrigger, setFocusTrigger] = useState(0)

	const createSubitem = useCreateSubitem()
	const removeSubitem = useRemoveSubitem()

	const { data, isLoading, error } = useTaskById(selectedTaskId)

	const { data: subitems, isLoading: isLoadingSubitems } =
		useSubitems(selectedTaskId)

	const subitemTree = buildSubitemTree(subitems ?? [])

	const focusSubitem = (id: SubitemId) => {
		const ref = inputRefs.current.get(id)?.current
		if (!ref) return

		if (Platform.OS === 'web') {
			const element = ref as HTMLDivElement
			element.focus()
			const range = document.createRange()
			const selection = window.getSelection()
			range.selectNodeContents(element)
			range.collapse(false)
			selection?.removeAllRanges()
			selection?.addRange(range)
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).focus()
		}
	}

	const handleAddAfter = (afterId: SubitemId) => {
		// Find the subitem to get task_id, parent_id, type
		const afterSubitem = subitems?.find((s) => s.id === afterId)
		if (!afterSubitem) return

		createSubitem.mutate(
			{
				info: '',
				task_id: selectedTaskId,
				parent_id: afterSubitem.parent_id ?? null,
				type: 'ul'
			},
			{
				onSuccess: (newSubitem) => {
					pendingFocusId.current = newSubitem.id
					// setFocusTrigger(t => t + 1)
					// 	setTimeout(() => focusSubitem(newSubitem.id), 50)
				}
			}
		)
	}

	const handleAddAfterLast = () => {
		const lastSubitem = subitems?.[subitems.length - 1]
		createSubitem.mutate(
			{
				info: '',
				task_id: selectedTaskId,
				parent_id: null,
				type: 'ul'
			},
			{
				onSuccess: (newSubitem) => {
					pendingFocusId.current = newSubitem.id
					// setTimeout(() => focusSubitem(newSubitem.id), 50)
				}
			}
		)
	}

	const handleRemove = (removeId: SubitemId) => {
		const index = subitems?.findIndex((s) => s.id === removeId) ?? -1
		const previousSubitem = index > 0 ? subitems![index - 1] : null

		if (previousSubitem) {
			focusSubitem(previousSubitem.id)
		}

		removeSubitem.mutate(removeId)
	}

	// Show loading state when waiting for task data
	if (isLoading || isLoadingSubitems)
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
					Ошибка загрузки задачи:{' '}
					{error instanceof Error ? error.message : 'Неизвестная ошибка'}
				</Text>
			</View>
		)

	// Show not found state when no task data and not loading
	if (!data)
		return (
			<View style={commonStyles.mainArea}>
				<Text>Задача не найдена или не выбрана</Text>
			</View>
		)

	return (
		<ScrollBox>
			{subitemTree.map((subitemData) => (
				<SubitemNode
					inputRefs={inputRefs.current}
					key={subitemData.id}
					data={subitemData}
					depth={0}
					variant={subitemData.type}
					onAddAfter={handleAddAfter}
					onRemove={handleRemove}
					pendingFocusId={pendingFocusId}
				/>
			))}
			<Pressable style={styles.addButton} onPress={() => handleAddAfterLast()}>
				<MaterialIcons name='add' size={28} color={theme.colors.minor} />
			</Pressable>
		</ScrollBox>
	)
}

const styles = StyleSheet.create((theme) => ({
	addButton: {
		marginTop: 4,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: theme.spacing.xs,
		backgroundColor: theme.colors.mutedLightFill,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_lg,
		borderBottomRightRadius: STYLE_VARS.radius_lg
	}
}))
