import { MenuView } from '@expo/ui/community/menu'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { BlockEntity, BlockSettings } from '@/shared/domain/block'
import { findUnitById, type UnitCategory, UNITS } from '@/shared/domain/units'
import { STYLE_VARS } from '@/shared/styles/common'
import { Toggle } from '@/shared/ui/Toggle'

type BlockSettingsFormProps = {
	block: BlockEntity
	onChange: (patch: BlockSettings) => void
}

/**
 * Renders settings fields specific to the block's type. Common fields
 * (checkable, journaled) apply to every *Block variant; type-specific
 * fields are added below for timer/stopwatch/counter.
 */
export function BlockSettingsForm({ block, onChange }: BlockSettingsFormProps) {
	const { theme } = useUnistyles()
	const { t } = useTranslation()
	const settings = block.settings ?? {}

	const UNIT_CATEGORY_LABELS: Record<UnitCategory, string> = {
		weight: 'Вес',
		distance: 'Расстояние',
		volume: 'Объём',
		quantity: 'Количество'
	}

	const unitMenuActions = useMemo(() => {
		const categories = Array.from(new Set(UNITS.map((unit) => unit.category)))
		return categories.map((category) => ({
			id: category,
			title: t(`units.category.${category}` as UnitCategory),
			subactions: UNITS.filter((unit) => unit.category === category).map(
				(unit) => ({
					id: unit.id,
					title: `${t(unit.labelKey)} (${t(`units.system.${unit.system}`)})`,
					state: (settings.units === unit.id ? 'on' : 'off') as 'on' | 'off'
				})
			)
		}))
	}, [settings.units, t])

	return (
		<View style={styles.Form}>
			<View style={styles.Form__row}>
				<View style={styles.Form__rowLabel}>
					<MaterialDesignIcons
						name='checkbox-marked-outline'
						size={20}
						color={theme.colors.major}
					/>
					<Text style={styles.Form__labelText}>Чекбокс</Text>
				</View>
				<Toggle
					value={settings.checkable ?? false}
					onChange={(checkable) => onChange({ checkable })}
				/>
			</View>

			<View style={styles.Form__row}>
				<View style={styles.Form__rowLabel}>
					<MaterialDesignIcons
						name='calendar-refresh-outline'
						size={20}
						color={theme.colors.major}
					/>
					<Text style={styles.Form__labelText}>Журналировать по дням</Text>
				</View>
				<Toggle
					value={settings.journaled ?? false}
					onChange={(journaled) => onChange({ journaled })}
				/>
			</View>

			<View style={styles.Form__row}>
				<View style={styles.Form__rowLabel}>
					<MaterialDesignIcons
						name='chart-line'
						size={20}
						color={theme.colors.major}
					/>
					<Text style={styles.Form__labelText}>Показывать в статистике</Text>
				</View>
				<Toggle
					value={settings.in_stats ?? false}
					onChange={(in_stats) => onChange({ in_stats })}
				/>
			</View>

			{(block.type === 'timer' || block.type === 'stopwatch') && (
				<View style={styles.Form__row}>
					<Text style={styles.Form__labelText}>Длительность (сек)</Text>
					<TextInput
						style={styles.Form__input}
						keyboardType='numeric'
						defaultValue={String((settings.duration ?? 0) / 1000)}
						onEndEditing={(event) =>
							onChange({
								duration: Number(event.nativeEvent.text || 0) * 1000
							})
						}
					/>
				</View>
			)}

			{block.type === 'timer' && (
				<View style={styles.Form__row}>
					<Text style={styles.Form__labelText}>Режим</Text>
					<View style={styles.Form__modeToggle}>
						<Text
							style={[
								styles.Form__modeOption,
								settings.mode !== 'decreasing' && styles.Form__modeOption_active
							]}
							onPress={() => onChange({ mode: 'increasing' })}
						>
							Вверх
						</Text>
						<Text
							style={[
								styles.Form__modeOption,
								settings.mode === 'decreasing' && styles.Form__modeOption_active
							]}
							onPress={() => onChange({ mode: 'decreasing' })}
						>
							Вниз
						</Text>
					</View>
				</View>
			)}

			{block.type === 'counter' && (
				<>
					<View style={styles.Form__row}>
						<Text style={styles.Form__labelText}>Цель</Text>
						<TextInput
							style={styles.Form__input}
							keyboardType='numeric'
							defaultValue={String(settings.goal ?? 0)}
							onEndEditing={(event) =>
								onChange({ goal: Number(event.nativeEvent.text || 0) })
							}
						/>
					</View>
					<View style={styles.Form__row}>
						<Text style={styles.Form__labelText}>Начальное значение</Text>
						<TextInput
							style={styles.Form__input}
							keyboardType='numeric'
							defaultValue={String(settings.start ?? 0)}
							onEndEditing={(event) =>
								onChange({ start: Number(event.nativeEvent.text || 0) })
							}
						/>
					</View>
					<View style={styles.Form__row}>
						<Text style={styles.Form__labelText}>Текущее значение</Text>
						<TextInput
							style={styles.Form__input}
							keyboardType='numeric'
							defaultValue={String(settings.value ?? 0)}
							onEndEditing={(event) =>
								onChange({ value: Number(event.nativeEvent.text || 0) })
							}
						/>
					</View>
					<View style={styles.Form__row}>
						<Text style={styles.Form__labelText}>{t('form.units')}</Text>
						<MenuView
							actions={unitMenuActions}
							onPressAction={(event) =>
								onChange({ units: event.nativeEvent.event })
							}
						>
							<Text style={styles.Form__input}>
								{findUnitById(settings.units)
									? t(findUnitById(settings.units)!.labelKey)
									: t('units.selectPlaceholder')}
							</Text>
						</MenuView>
					</View>
					<View style={styles.Form__row}>
						<Text style={styles.Form__labelText}>Количество повторений</Text>
						<TextInput
							style={styles.Form__input}
							keyboardType='numeric'
							defaultValue={String(settings.count ?? 0)}
							onEndEditing={(event) =>
								onChange({ count: Number(event.nativeEvent.text || 0) })
							}
						/>
					</View>
				</>
			)}
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Form: {
		paddingHorizontal: STYLE_VARS.sidePadding,
		paddingTop: 8,
		paddingBottom: 24,
		gap: 4
	},
	Form__row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 12
	},
	Form__rowLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	},
	Form__labelText: {
		fontSize: 15,
		fontWeight: '500',
		color: theme.colors.major
	},
	Form__input: {
		fontSize: 15,
		color: theme.colors.major,
		minWidth: 100,
		textAlign: 'right'
	},
	Form__modeToggle: {
		flexDirection: 'row',
		gap: 12
	},
	Form__modeOption: {
		fontSize: 14,
		color: theme.colors.minor
	},
	Form__modeOption_active: {
		color: theme.colors.primary,
		fontWeight: '600'
	}
}))
