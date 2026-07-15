import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { Pressable, Text } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useTaskListViewStore } from './model/taskListView.store'

type AllTasksActionSheetMenuProps = {
	onSelect: () => void
}

export default function AllTasksActionSheetMenu({
	onSelect
}: AllTasksActionSheetMenuProps) {
	const { theme } = useUnistyles()
	const setLifecycleFilter = useTaskListViewStore(
		(state) => state.setLifecycleFilter
	)

	const handlePressDeleted = () => {
		setLifecycleFilter('deleted')
		onSelect()
	}

	return (
		<Pressable style={styles.MenuItem} onPress={handlePressDeleted}>
			<MaterialDesignIcons
				name='trash-can-outline'
				size={22}
				color={theme.colors.mutedTextStrong}
			/>
			<Text style={styles.MenuItem__label}>Удалённые задачи</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create((theme) => ({
	MenuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 12
	},
	MenuItem__label: {
		fontSize: 16,
		color: theme.colors.major
	}
}))
