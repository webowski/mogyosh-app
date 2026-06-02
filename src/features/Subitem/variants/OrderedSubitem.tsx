import { Text, View } from 'react-native'

import { SubitemProps } from '../index'

export default function OrderedSubitem({ data }: SubitemProps) {
	return (
		<View>
			<Text>1. {data.info}</Text>
		</View>
	)
}
