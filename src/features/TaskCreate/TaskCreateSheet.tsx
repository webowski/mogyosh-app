import { TrueSheet } from '@lodev09/react-native-true-sheet'
import React from 'react'

import { TaskCreateForm } from './TaskCreateForm'

export const taskCreateSheetRef = React.createRef<TrueSheet>()

export function TaskCreateSheet() {
	return (
		<TrueSheet
			ref={taskCreateSheetRef}
			detents={[0.9]}
			cornerRadius={16}
			// initialIndex={0}
		>
			<TaskCreateForm onClose={() => taskCreateSheetRef.current?.dismiss()} />
		</TrueSheet>
	)
}
