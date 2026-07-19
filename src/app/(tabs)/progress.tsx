import { ScrollView, Text } from 'react-native'

import { staticStyles } from '@/shared/styles/common'
import { textStyles } from '@/shared/styles/text'
import { Chart } from '@/shared/ui/Chart'

const weeklyData = [
	{ week: 'Нед 1', count: 8 },
	{ week: 'Нед 2', count: 10 },
	{ week: 'Нед 3', count: 9 },
	{ week: 'Нед 4', count: 12 },
	{ week: 'Нед 5', count: 15 },
	{ week: 'Нед 6', count: 14 },
	{ week: 'Нед 7', count: 18 },
	{ week: 'Нед 8', count: 20 }
]

export default function ProgressScreen() {
	return (
		<ScrollView
			style={staticStyles.ScrollBox}
			contentContainerStyle={staticStyles.ScrollBox__inner}
			overScrollMode='never'
		>
			<Text style={[textStyles.heading2, { marginBottom: 8 }]}>
				Подтягивания
			</Text>
			<Chart />
		</ScrollView>
	)
}
