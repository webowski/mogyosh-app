import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { useShallow } from 'zustand/react/shallow'

import type { TaskId } from '@/shared/domain/ids'
import { type UnitCategory, UNITS } from '@/shared/domain/units'
import { STYLE_VARS } from '@/shared/styles/common'
import { selectBlocks, useBlockStore } from './model/block.store'
import { useUnitSheetStore } from './model/unitSheet.store'
import { useUpdateBlock } from './model/useUpdateBlock'

const UNIT_CATEGORIES: UnitCategory[] = [
	'weight',
	'distance',
	'volume',
	'quantity'
]

export function UnitSheet() {
	const { theme } = useUnistyles()
	const { t } = useTranslation()
	const sheetRef = useRef<TrueSheet>(null)
	const updateBlock = useUpdateBlock()

	const isOpen = useUnitSheetStore((state) => state.isOpen)
	const payload = useUnitSheetStore((state) => state.payload)
	const close = useUnitSheetStore((state) => state.close)

	const taskBlocks = useBlockStore(
		useShallow(selectBlocks((payload?.taskId ?? null) as TaskId))
	)
	const block = taskBlocks.find((item) => item.id === payload?.blockId)

	const selectedUnitId = block?.settings?.units

	const unitsByCategory = useMemo(() => {
		return UNIT_CATEGORIES.map((category) => ({
			category,
			units: UNITS.filter((unit) => unit.category === category)
		})).filter((group) => group.units.length > 0)
	}, [])

	useEffect(() => {
		if (isOpen) {
			sheetRef.current?.present()
		}
	}, [isOpen])

	const handleSelectUnit = (unitId: string) => {
		if (!payload || !block) return

		updateBlock.mutate({
			id: payload.blockId,
			taskId: payload.taskId,
			patch: {
				settings: {
					...block.settings,
					units: unitId
				}
			}
		})

		sheetRef.current?.dismiss()
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
			<Text style={styles.UnitSheet__title}>{t('form.units')}</Text>

			<View style={styles.UnitSheet__content}>
				{unitsByCategory.map((group) => (
					<View key={group.category} style={styles.UnitSheet__group}>
						<Text style={styles.UnitSheet__groupTitle}>
							{t(`units.category.${group.category}`)}
						</Text>
						<View style={styles.UnitSheet__options}>
							{group.units.map((unit) => {
								const isSelected = selectedUnitId === unit.id

								return (
									<Pressable
										key={unit.id}
										style={[
											styles.UnitSheet__option,
											isSelected && styles.UnitSheet__option_selected
										]}
										onPress={() => handleSelectUnit(unit.id)}
									>
										<Text
											style={[
												styles.UnitSheet__optionText,
												isSelected && styles.UnitSheet__optionText_selected
											]}
										>
											{t(unit.labelKey)}
										</Text>
									</Pressable>
								)
							})}
						</View>
					</View>
				))}
			</View>
		</TrueSheet>
	)
}

const styles = StyleSheet.create((theme) => ({
	UnitSheet__title: {
		fontSize: 17,
		fontWeight: '600',
		color: theme.colors.major,
		textAlign: 'center',
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 4,
		paddingBottom: 12
	},
	UnitSheet__content: {
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingBottom: 24,
		gap: 16
	},
	UnitSheet__group: {
		gap: 8
	},
	UnitSheet__groupTitle: {
		fontSize: 13,
		fontWeight: '600',
		color: theme.colors.mutedText,
		textTransform: 'uppercase'
	},
	UnitSheet__options: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8
	},
	UnitSheet__option: {
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: STYLE_VARS.radius_md,
		backgroundColor: theme.colors.surfaceClosest
	},
	UnitSheet__option_selected: {
		backgroundColor: theme.colors.primary
	},
	UnitSheet__optionText: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.major
	},
	UnitSheet__optionText_selected: {
		color: theme.colors.surfaceDeep
	}
}))
