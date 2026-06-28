import { forwardRef, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import {
	EnrichedMarkdownTextInput,
	type EnrichedMarkdownTextInputInstance
} from 'react-native-enriched-markdown'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

interface MarkdownInputProps {
	subitemText: string
	onChangeText?: (text: string) => void
	onChangeMarkdown?: (markdown: string) => void
	onEnterPress?: () => void
	onBackspaceOnEmpty?: () => void
	onFocus?: () => void
}

export const MarkdownInput = forwardRef<
	EnrichedMarkdownTextInputInstance | HTMLDivElement,
	MarkdownInputProps
>(
	(
		{
			subitemText,
			onChangeText,
			onChangeMarkdown,
			onEnterPress,
			onBackspaceOnEmpty,
			onFocus
		},
		ref
	) => {
		const { theme } = useUnistyles()

		if (Platform.OS === 'web') {
			return (
				<WebDivInput
					subitemText={subitemText}
					onChangeText={onChangeText}
					onEnterPress={onEnterPress}
					onBackspaceOnEmpty={onBackspaceOnEmpty}
					onFocus={onFocus}
					divRef={ref as React.Ref<HTMLDivElement>}
				/>
			)
		}

		return (
			<EnrichedMarkdownTextInput
				ref={
					ref as unknown as React.RefObject<EnrichedMarkdownTextInputInstance>
				}
				style={styles.Input}
				defaultValue={subitemText}
				placeholderTextColor={theme.colors.minor}
				scrollEnabled={false}
				multiline
				onFocus={onFocus}
				onChangeText={(text) => {
					if (text.includes('\n')) {
						;(
							ref as React.RefObject<EnrichedMarkdownTextInputInstance>
						).current?.setValue(subitemText)
						onEnterPress?.()
					} else if (text === '') {
						onBackspaceOnEmpty?.()
					}
				}}
				onChangeMarkdown={onChangeMarkdown}
			/>
		)
	}
)

MarkdownInput.displayName = 'MarkdownInput'

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

interface WebDivInputProps {
	subitemText: string
	onChangeText?: (text: string) => void
	onEnterPress?: () => void
	onBackspaceOnEmpty?: () => void
	onFocus?: () => void
	divRef: React.Ref<HTMLDivElement>
}

function WebDivInput({
	subitemText,
	onChangeText,
	onEnterPress,
	onBackspaceOnEmpty,
	onFocus,
	divRef
}: WebDivInputProps) {
	const { theme } = useUnistyles()
	const localRef = useRef<HTMLDivElement>(null)
	const resolvedRef = (divRef as React.RefObject<HTMLDivElement>) ?? localRef

	useEffect(
		() => {
			if (resolvedRef.current) {
				resolvedRef.current.innerText = subitemText
			}
		},
		// eslint-disable-next-line
		[]
	)

	return (
		<div
			ref={resolvedRef}
			contentEditable
			suppressContentEditableWarning
			onInput={(event) => {
				onChangeText?.((event.currentTarget as HTMLDivElement).innerText)
			}}
			onFocus={onFocus}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					event.preventDefault()
					onEnterPress?.()
				} else if (event.key === 'Backspace') {
					const text = (event.currentTarget as HTMLDivElement).innerText
					if (text === '' || text === '\n') {
						event.preventDefault()
						onBackspaceOnEmpty?.()
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
