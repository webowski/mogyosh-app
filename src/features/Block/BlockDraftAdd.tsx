import { useEffect, useRef, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { StyleSheet } from 'react-native-unistyles'

import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { blockStyles } from './style'

interface BlockDraftAddProps {
	onAddBlock: (initialText: string) => void
}

export default function BlockDraftAdd({ onAddBlock }: BlockDraftAddProps) {
	const [isEditing, setIsEditing] = useState(false)
	const draftInputRef = useRef<
		EnrichedMarkdownTextInputInstance | HTMLDivElement
	>(null)
	const hasCreatedBlock = useRef(false)

	useEffect(() => {
		if (!isEditing) return

		// Double rAF to ensure the input is mounted before focusing
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const ref = draftInputRef.current
				if (!ref) return
				if (Platform.OS === 'web') {
					;(ref as HTMLDivElement).focus()
				} else {
					;(ref as EnrichedMarkdownTextInputInstance).focus()
				}
			})
		})
	}, [isEditing])

	const handlePressEmptyArea = () => {
		hasCreatedBlock.current = false
		setIsEditing(true)
	}

	const handleChangeMarkdown = (markdown: string) => {
		if (markdown.length === 0 || hasCreatedBlock.current) return

		hasCreatedBlock.current = true
		onAddBlock(markdown)
		setIsEditing(false)
	}

	const handleBlur = () => {
		if (!hasCreatedBlock.current) setIsEditing(false)
	}

	const handleBackspaceOnEmpty = () => {
		if (!hasCreatedBlock.current) setIsEditing(false)
	}

	if (!isEditing) {
		return <Pressable style={styles.EmptyArea} onPress={handlePressEmptyArea} />
	}

	return (
		<MarkdownInput
			ref={draftInputRef}
			blockText=''
			onChangeMarkdown={handleChangeMarkdown}
			onBackspaceOnEmpty={handleBackspaceOnEmpty}
			onBlur={handleBlur}
			style={[blockStyles.Paragraph, blockStyles.text]}
		/>
	)
}

const styles = StyleSheet.create((theme) => ({
	EmptyArea: {
		minHeight: 30,
		paddingVertical: theme.spacing.xs
	}
}))
