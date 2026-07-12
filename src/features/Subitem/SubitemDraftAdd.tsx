import { useEffect, useRef, useState } from 'react'
import { Platform, Pressable } from 'react-native'
import type { EnrichedMarkdownTextInputInstance } from 'react-native-enriched-markdown'
import { StyleSheet } from 'react-native-unistyles'

import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { subitemStyles } from './style'

interface SubitemDraftAddProps {
	onAddSubitem: (initialText: string) => void
}

export default function SubitemDraftAdd({
	onAddSubitem
}: SubitemDraftAddProps) {
	const [isEditing, setIsEditing] = useState(false)
	const draftInputRef = useRef<
		EnrichedMarkdownTextInputInstance | HTMLDivElement
	>(null)
	const hasCreatedSubitem = useRef(false)

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
		hasCreatedSubitem.current = false
		setIsEditing(true)
	}

	const handleChangeMarkdown = (markdown: string) => {
		if (markdown.length === 0 || hasCreatedSubitem.current) return

		hasCreatedSubitem.current = true
		onAddSubitem(markdown)
		setIsEditing(false)
	}

	const handleBlur = () => {
		if (!hasCreatedSubitem.current) setIsEditing(false)
	}

	const handleBackspaceOnEmpty = () => {
		if (!hasCreatedSubitem.current) setIsEditing(false)
	}

	if (!isEditing) {
		return <Pressable style={styles.EmptyArea} onPress={handlePressEmptyArea} />
	}

	return (
		<MarkdownInput
			ref={draftInputRef}
			subitemText=''
			onChangeMarkdown={handleChangeMarkdown}
			onBackspaceOnEmpty={handleBackspaceOnEmpty}
			onBlur={handleBlur}
			style={[subitemStyles.Paragraph, subitemStyles.text]}
		/>
	)
}

const styles = StyleSheet.create((theme) => ({
	EmptyArea: {
		minHeight: 30,
		paddingVertical: theme.spacing.xs
	}
}))
