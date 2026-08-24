import { ScrollView, Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import type { BlockData } from '@/shared/domain/block'
import Checkbox from '@/shared/ui/Checkbox'
import { useBlockLogic } from './model/useBlockLogic'

type BlockDebugFlatListProps = {
	blockTree: BlockData[]
}

// TEMPORARY: flattens the block tree into a plain list, ignoring depth/parent
function flattenBlockDataTree(tree: BlockData[]): BlockData[] {
	return tree.flatMap((item) => [item, ...flattenBlockDataTree(item.children)])
}

// TEMPORARY: minimal reproduction, no GestureDetector, no DragSort, no MarkdownInput
export function BlockDebugFlatList({ blockTree }: BlockDebugFlatListProps) {
	const blocks = flattenBlockDataTree(blockTree)

	return (
		<ScrollView style={styles.Container}>
			{/* <DebugBlock /> */}
			{blocks.map((block) => (
				<DebugBlockRow key={block.id} data={block} />
			))}
		</ScrollView>
	)
}

function DebugBlockRow({ data }: { data: BlockData }) {
	const { checked, handlePressCheckbox } = useBlockLogic({
		data,
		blockType: data.type
	})

	return (
		<View style={styles.Row}>
			{data.settings?.checkable && (
				<Checkbox checked={checked} onPress={handlePressCheckbox} />
			)}
			<Text style={styles.Row__text}>{data.text_content || '(пусто)'}</Text>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	Container: {
		flex: 1,
		padding: theme.spacing.md
	},
	Row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
		paddingVertical: theme.spacing.sm
	},
	Row__text: {
		color: theme.colors.major
	}
}))
