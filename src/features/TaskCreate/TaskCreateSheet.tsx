import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { useUnistyles } from 'react-native-unistyles'

import { useTaskCreateStore } from '@/features/TaskCreate/model/taskCreate.store'
import { TaskCreateForm } from '@/features/TaskCreate/TaskCreateForm'
import { STYLE_VARS } from '@/shared/styles/common'

export function TaskCreateSheet() {
	const { theme } = useUnistyles()

	const bottomSheetModalRef = useRef<BottomSheetModal>(null)

	const isOpen = useTaskCreateStore((state) => state.isOpen)
	const close = useTaskCreateStore((state) => state.close)

	useEffect(() => {
		if (isOpen) {
			bottomSheetModalRef.current?.present()
		} else {
			bottomSheetModalRef.current?.dismiss()
		}
	}, [isOpen])

	return (
		<BottomSheetModal
			ref={bottomSheetModalRef}
			enableDynamicSizing={false}
			snapPoints={['92%']}
			topInset={STYLE_VARS.sidePadding}
			keyboardBehavior='extend'
			keyboardBlurBehavior='restore'
			android_keyboardInputMode='adjustResize'
			backgroundStyle={{ backgroundColor: theme.colors.surfaceAlter }}
			handleIndicatorStyle={{ backgroundColor: theme.colors.minor }}
			onDismiss={close}
		>
			<BottomSheetView style={{ flex: 1 }}>
				<TaskCreateForm onClose={close} />
			</BottomSheetView>
		</BottomSheetModal>
	)
}
