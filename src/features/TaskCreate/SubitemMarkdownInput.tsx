import { forwardRef } from 'react'
import { Platform } from 'react-native'
import {
	EnrichedMarkdownTextInput,
	type EnrichedMarkdownTextInputInstance
} from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

interface SubitemMarkdownInputProps {
	itemText: string
	onChangeText: (text: string) => void
	onChangeMarkdown: (markdown: string) => void
	onEnterPress: () => void
	onBackspaceOnEmpty: () => void
}

export const SubitemMarkdownInput = forwardRef<
	EnrichedMarkdownTextInputInstance | HTMLDivElement,
	SubitemMarkdownInputProps
>(
	(
		{
			itemText,
			onChangeText,
			onChangeMarkdown,
			onEnterPress,
			onBackspaceOnEmpty
		},
		ref
	) => {
		const { theme } = useUnistyles()

		if (Platform.OS === 'web') {
			return (
				<div
					ref={ref as React.Ref<HTMLDivElement>}
					contentEditable
					suppressContentEditableWarning
					onInput={(event) => {
						onChangeText((event.currentTarget as HTMLDivElement).innerText)
					}}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault()
							onEnterPress()
						} else if (event.key === 'Backspace') {
							const text = (event.currentTarget as HTMLDivElement).innerText
							if (text === '' || text === '\n') {
								event.preventDefault()
								onBackspaceOnEmpty()
							}
						}
					}}
					// @ts-ignore - web-only inline styles
					style={{
						flex: 1,
						fontSize: 16,
						fontWeight: 500,
						color: theme.colors.major,
						paddingTop: theme.spacing.xs,
						paddingBottom: theme.spacing.xs,
						outline: 'none',
						minHeight: 22,
						wordBreak: 'break-word'
					}}
				/>
			)
		}

		return (
			<EnrichedMarkdownTextInput
				ref={
					ref as unknown as React.RefObject<EnrichedMarkdownTextInputInstance>
				}
				style={styles.Input}
				defaultValue={itemText}
				placeholderTextColor={theme.colors.minor}
				scrollEnabled={false}
				multiline
				onChangeText={(text) => {
					if (text.includes('\n')) {
						;(
							ref as React.RefObject<EnrichedMarkdownTextInputInstance>
						).current?.setValue(itemText)
						onEnterPress()
					} else if (text === '') {
						onBackspaceOnEmpty()
					}
				}}
				onChangeMarkdown={onChangeMarkdown}
			/>
		)
	}
)

SubitemMarkdownInput.displayName = 'SubitemMarkdownInput'

const styles = StyleSheet.create((theme) => ({
	Input: {
		flex: 1,
		fontSize: 16,
		fontWeight: '400',
		color: theme.colors.major,
		paddingVertical: theme.spacing.xs,
		outline: 'none'
	}
}))
