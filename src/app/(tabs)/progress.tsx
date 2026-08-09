import { ScrollView, Text, View } from 'react-native'

import { useStatsBlocks } from '@/features/BlockState/model/useStatsBlocks'
import { staticStyles } from '@/shared/styles/common'
import { textStyles } from '@/shared/styles/text'
import { Chart } from '@/shared/ui/Chart'

export default function ProgressScreen() {
	const { data: statsBlocks, isLoading } = useStatsBlocks()

	if (isLoading) return null

	return (
		<ScrollView
			style={staticStyles.ScrollBox}
			contentContainerStyle={staticStyles.ScrollBox__inner}
			overScrollMode='never'
		>
			{statsBlocks?.map(({ block, series }) => {
				return (
					<View key={block.id} style={{ marginBottom: 24 }}>
						<Text style={[textStyles.heading2, { marginBottom: 8 }]}>
							{block.text_content}
						</Text>
						<Chart valuesData={series} blockData={block} />
					</View>
				)
			})}
		</ScrollView>
	)
}
