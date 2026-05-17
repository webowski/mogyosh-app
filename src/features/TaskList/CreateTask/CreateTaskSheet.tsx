import { TrueSheet } from '@lodev09/react-native-true-sheet'
import React from 'react'

import { CreateTaskForm } from './CreateTaskForm'

export const createTaskSheetRef = React.createRef<TrueSheet>()

export function CreateTaskSheet() {
	return (
		<TrueSheet
			ref={createTaskSheetRef}
			detents={[0.9]}
			cornerRadius={16}
			// initialIndex={0}
		>
			<CreateTaskForm onClose={() => createTaskSheetRef.current?.dismiss()} />
		</TrueSheet>
	)
}
