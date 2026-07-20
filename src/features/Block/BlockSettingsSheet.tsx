import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useEffect, useRef } from 'react'
import { Text } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { useShallow } from 'zustand/react/shallow'

import type { BlockSettings } from '@/shared/domain/block'
import type { TaskId } from '@/shared/domain/ids'
import { useEditorToolbarStore } from '@/shared/model/editorToolbar.store'
import { STYLE_VARS } from '@/shared/styles/common'
import { BlockSettingsForm } from './BlockSettingsForm'
import { selectBlocks, useBlockStore } from './model/block.store'
import { useBlockSettingsSheetStore } from './model/blockSettingsSheet.store'
import { useUpdateBlock } from './model/useUpdateBlock'

export function BlockSettingsSheet() {
	const { theme } = useUnistyles()

	const sheetRef = useRef<TrueSheet>(null)

	const isOpen = useBlockSettingsSheetStore((state) => state.isOpen)
	const close = useBlockSettingsSheetStore((state) => state.close)

	const activeItemId = useEditorToolbarStore((state) => state.activeItemId)
	const focusedBlockId = useEditorToolbarStore((state) => state.focusedBlockId)

	const taskBlocks = useBlockStore(
		useShallow(selectBlocks(activeItemId as TaskId))
	)
	const focusedBlock = taskBlocks.find((block) => block.id === focusedBlockId)

	const updateBlock = useUpdateBlock()

	useEffect(() => {
		if (isOpen) {
			sheetRef.current?.present()
		}
	}, [isOpen])

	const handleChange = (patch: BlockSettings) => {
		if (!focusedBlock) return

		updateBlock.mutate({
			id: focusedBlock.id,
			taskId: activeItemId as TaskId,
			patch: { settings: { ...focusedBlock.settings, ...patch } }
		})
	}

	return (
		<TrueSheet
			ref={sheetRef}
			detents={['auto']}
			cornerRadius={STYLE_VARS.radius_2xl}
			backgroundColor={theme.colors.surfaceDeep}
			grabberOptions={{ color: theme.colors.minor }}
			onDidDismiss={close}
		>
			{focusedBlock && (
				<>
					<Text
						style={{
							fontSize: 17,
							fontWeight: '600',
							color: theme.colors.major,
							paddingHorizontal: STYLE_VARS.sidePadding,
							paddingTop: 4,
							paddingBottom: 8
						}}
					>
						Настройки блока
					</Text>
					<BlockSettingsForm block={focusedBlock} onChange={handleChange} />
				</>
			)}
		</TrueSheet>
	)
}
