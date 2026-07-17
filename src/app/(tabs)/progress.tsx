import { ScrollView, Text } from 'react-native'

import { staticStyles } from '@/shared/styles/common'

export default function ProgressScreen() {
	return (
		<ScrollView
			style={staticStyles.ScrollBox}
			contentContainerStyle={staticStyles.ScrollBox__inner}
			overScrollMode='never'
		>
			<Text>Progress</Text>
		</ScrollView>
	)
}
