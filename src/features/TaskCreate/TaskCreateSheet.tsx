import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useEffect, useRef } from 'react'
import { useUnistyles } from 'react-native-unistyles'

import { STYLE_VARS } from '@/shared/styles/common'
import { useTaskCreateStore } from './model/taskCreate.store'
import { TaskCreateForm } from './TaskCreateForm'

export function TaskCreateSheet() {
	const { theme } = useUnistyles()

	const sheetRef = useRef<TrueSheet>(null)

	const isOpen = useTaskCreateStore((state) => state.isOpen)
	const close = useTaskCreateStore((state) => state.close)

	useEffect(() => {
		if (isOpen) {
			sheetRef.current?.present()
		} else {
			sheetRef.current?.dismiss()
		}
	}, [isOpen])

	return (
		<TrueSheet
			ref={sheetRef}
			detents={['auto']}
			cornerRadius={STYLE_VARS.radius_2xl}
			backgroundColor={theme.colors.surfaceAlter}
			grabberOptions={{ color: theme.colors.minor }}
			onDidDismiss={close}
		>
			<TaskCreateForm onClose={close} />
		</TrueSheet>
	)
}
