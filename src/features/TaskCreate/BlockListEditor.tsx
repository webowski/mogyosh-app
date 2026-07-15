import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useRef } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { type EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { type BlockInsert } from '@/shared/domain/block'
import { BlockId } from '@/shared/domain/ids'
import { STYLE_VARS } from '@/shared/styles/common'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'

interface BlockListEditorProps {
	blocks: BlockInsert[]
	onChange: (blocks: BlockInsert[]) => void
}

export function BlockListEditor({ blocks, onChange }: BlockListEditorProps) {
	const { theme } = useUnistyles()

	const inputRefs = useRef<
		Map<
			string,
			React.RefObject<EnrichedMarkdownTextInputInstance | HTMLDivElement | null>
		>
	>(new Map())

	const getRefForBlockInput = (id: string) => {
		if (!inputRefs.current.has(id)) {
			inputRefs.current.set(id, { current: null })
		}
		return inputRefs.current.get(id)!
	}

	const moveCursorToEnd = (element: HTMLDivElement) => {
		const range = document.createRange()
		const selection = window.getSelection()
		range.selectNodeContents(element)
		range.collapse(false)
		selection?.removeAllRanges()
		selection?.addRange(range)
	}

	const focusBlock = (id: string) => {
		const ref = inputRefs.current.get(id)?.current
		if (!ref) return

		if (Platform.OS === 'web') {
			const element = ref as HTMLDivElement
			element.focus()
			moveCursorToEnd(element)
		} else {
			;(ref as EnrichedMarkdownTextInputInstance).focus()
		}
	}

	const addBlockAfter = (index: number) => {
		const newBlock: BlockInsert = {
			id: Date.now().toString(),
			text_content: '',
			type: 'p'
		}
		const next = [...blocks]
		next.splice(index + 1, 0, newBlock)
		onChange(next)

		setTimeout(() => {
			focusBlock(newBlock.id as BlockId)
		}, 50)
	}

	const removeBlock = (index: number) => {
		if (blocks.length < 1) {
			onChange([{ ...blocks[0], text_content: '' }])
			return
		}

		const updatedBlocks = blocks.filter((_, i) => i !== index)
		onChange(updatedBlocks)

		if (updatedBlocks.length === 0) return

		const focusIndex = Math.max(0, index - 1)
		setTimeout(() => {
			focusBlock(updatedBlocks[focusIndex].id as BlockId)
		}, 50)
	}

	const updateBlock = (id: string, text_content: string) => {
		const blockIndex = blocks.findIndex((block) => block.id === id)
		const updatedItems = blocks.map((block) =>
			block.id === id ? { ...block, text_content } : block
		)
		onChange(updatedItems)

		// Auto-remove empty block when field is cleared
		// if (text_content === '' && blocks.length > 1) {
		if (text_content === '') {
			removeBlock(blockIndex)
		}
	}

	return (
		<View style={styles.container}>
			{blocks.map((block, index) => (
				<View key={block.id} style={styles.row}>
					<MarkdownInput
						ref={getRefForBlockInput(block.id)}
						blockText={block.text_content as string}
						onChangeText={(text_content) => updateBlock(block.id, text_content)}
						onChangeMarkdown={(markdown) => updateBlock(block.id, markdown)}
						onEnterPress={() => addBlockAfter(index)}
						onBackspaceOnEmpty={() => removeBlock(index)}
					/>
					<Checkbox checked={false} style={{ marginTop: 3 }} />
				</View>
			))}

			<Pressable
				style={styles.addButton}
				onPress={() => addBlockAfter(blocks.length - 1)}
			>
				<MaterialDesignIcons
					name='plus-thick'
					size={28}
					color={theme.colors.minor}
				/>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	container: {
		gap: 2
	},
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: theme.spacing.sm
	},
	addButton: {
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: theme.spacing.xs,
		backgroundColor: theme.colors.mutedSubtleFill,
		borderTopLeftRadius: STYLE_VARS.radius_sm,
		borderTopRightRadius: STYLE_VARS.radius_sm,
		borderBottomLeftRadius: STYLE_VARS.radius_lg,
		borderBottomRightRadius: STYLE_VARS.radius_lg
	}
}))
