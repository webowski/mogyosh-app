import { TrueSheet } from '@lodev09/react-native-true-sheet'
import WheelPicker, {
	withVirtualized
} from '@quidone/react-native-wheel-picker'
import { useEffect, useMemo, useRef } from 'react'
import { Text } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import { useShallow } from 'zustand/react/shallow'

import type { TaskId } from '@/shared/domain/ids'
import { STYLE_VARS } from '@/shared/styles/common'
import { selectBlocks, useBlockStore } from './model/block.store'
import { useCounterValueSheetStore } from './model/counterValueSheet.store'
import { useUpdateBlock } from './model/useUpdateBlock'

const VirtualizedWheelPicker = withVirtualized(WheelPicker)

const buildPickerData = (maxValue: number) =>
	Array.from({ length: maxValue + 1 }, (_, index) => ({
		value: index,
		label: String(index)
	}))

export function CounterValueSheet() {
	const { theme } = useUnistyles()
	const sheetRef = useRef<TrueSheet>(null)
	const updateBlock = useUpdateBlock()

	const isOpen = useCounterValueSheetStore((state) => state.isOpen)
	const payload = useCounterValueSheetStore((state) => state.payload)
	const close = useCounterValueSheetStore((state) => state.close)

	const taskBlocks = useBlockStore(
		useShallow(selectBlocks((payload?.taskId ?? null) as TaskId))
	)
	const block = taskBlocks.find((item) => item.id === payload?.blockId)

	const pickerData = useMemo(
		() => buildPickerData(payload?.maxValue ?? 0),
		[payload?.maxValue]
	)

	const currentValue =
		payload && block ? (block.settings?.[payload.field] ?? 0) : 0

	useEffect(() => {
		if (isOpen) {
			sheetRef.current?.present()
		}
	}, [isOpen])

	const handleValueChanged = ({ item }: { item: { value: number } }) => {
		if (!payload || !block) return

		updateBlock.mutate({
			id: payload.blockId,
			taskId: payload.taskId,
			patch: {
				settings: {
					...block.settings,
					[payload.field]: item.value
				}
			}
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
			{payload && (
				<>
					<Text
						style={{
							fontSize: 17,
							fontWeight: '600',
							color: theme.colors.major,
							textAlign: 'center',
							paddingHorizontal: STYLE_VARS.sidePadding,
							paddingTop: 4,
							paddingBottom: 8
						}}
					>
						{payload.title}
					</Text>
					<VirtualizedWheelPicker
						data={pickerData}
						value={currentValue}
						onValueChanged={handleValueChanged}
						enableScrollByTapOnItem={true}
						itemHeight={40}
						visibleItemCount={5}
						width='100%'
						itemTextStyle={{
							fontSize: 20,
							color: theme.colors.major
						}}
						overlayItemStyle={{
							backgroundColor: theme.colors.surfaceClosest
						}}
					/>
				</>
			)}
		</TrueSheet>
	)
}
