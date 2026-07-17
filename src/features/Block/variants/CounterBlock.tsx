import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { BlockProps } from '@/shared/domain/block'
import Checkbox from '@/shared/ui/Checkbox'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { blockStyles } from '../style'

type CounterBlockProps = BlockProps & {
	// onExpandToggle: (expanded: boolean) => void
}

export default function CounterBlock({
	data,
	onCheckToggle
}: CounterBlockProps) {
	const [checked, setChecked] = useState(data.state === 'done')

	const animationProgress = useSharedValue(checked ? 1 : 0)

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const handlePressCheckbox = useCallback(
		() => {
			setChecked(!checked)
			onCheckToggle?.(!checked)
		},
		// eslint-disable-next-line
		[checked]
	)

	return (
		<View style={blockStyles.Penoblok}>
			<View style={blockStyles.Timer__body}>
				<Text style={blockStyles.Timer__label}>{data.text_content}</Text>
				<View style={blockStyles.CounterSet}>
					<View style={blockStyles.Counter}>
						<Text style={blockStyles.Counter__value}>50</Text>
						<Text style={blockStyles.Counter__units}>кг</Text>
					</View>
					<View style={blockStyles.Counter}>
						<Text style={blockStyles.Counter__value}>10</Text>
						<Text style={blockStyles.Counter__units}>пвт.</Text>
					</View>
				</View>
			</View>
			<View style={blockStyles.Timer__actions}>
				{data.settings?.checkable && (
					<Checkbox checked={checked} onPress={handlePressCheckbox} />
				)}
			</View>
		</View>
	)
}
