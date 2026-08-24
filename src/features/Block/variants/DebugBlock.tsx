import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { debugStyles } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'

// export function DebugBlock({ data }: { data: BlockData }) {
export function DebugBlock() {
	// const { checked, handlePressCheckbox } = useBlockLogic({
	// 	data,
	// 	blockType: data.type
	// })

	const [checked, setChecked] = useState(true)

	const handlePressCheckbox = useCallback(() => {
		setChecked(!checked)
	}, [checked])

	return (
		<View style={debugStyles.Row}>
			<Checkbox checked={checked} onPress={handlePressCheckbox} />
			<Text style={debugStyles.Row__text}>DebugBlock</Text>
		</View>
	)
}
