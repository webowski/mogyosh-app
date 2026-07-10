import { forwardRef, useEffect, useRef } from 'react'
import { Platform, type StyleProp, type ViewStyle } from 'react-native'
import {
	EnrichedMarkdownTextInput,
	type EnrichedMarkdownTextInputInstance
} from 'react-native-enriched-markdown'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

interface MarkdownInputProps {
	subitemText: string
	onChangeText?: (text: string) => void
	onChangeMarkdown?: (markdown: string) => void
	onEnterPress?: () => void
	onBackspaceOnEmpty?: () => void
	onFocus?: () => void
	style?: StyleProp<AnimatedStyle<ViewStyle>>
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
			onFocus,
			style
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
					style={style}
				/>
			)
		}

		return (
			<Animated.View style={style}>
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
						if (text.endsWith('\n')) {
							;(
								ref as React.RefObject<EnrichedMarkdownTextInputInstance>
							).current?.setValue(subitemText.trim())
							onEnterPress?.()
						} else if (text === '') {
							onBackspaceOnEmpty?.()
						}
					}}
					onChangeMarkdown={(markdown) => {
						onChangeMarkdown?.(
							markdown.endsWith('\n') ? markdown.slice(0, -1) : markdown
						)
					}}
					markdownStyle={
						{
							// strong: { color: 'red' }
							// em: { color: '#7C3AED' },
							// link: { color: '#2563EB', underline: true },
							// h1: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
						}
					}
				/>
			</Animated.View>
		)
	}
)

MarkdownInput.displayName = 'MarkdownInput'

const styles = StyleSheet.create((theme) => ({
	Input: {
		flex: 1,
		fontSize: 16,
		fontWeight: '500',
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
	style?: StyleProp<AnimatedStyle<ViewStyle>>
}

function WebDivInput({
	subitemText,
	onChangeText,
	onEnterPress,
	onBackspaceOnEmpty,
	onFocus,
	divRef,
	style
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
			// @ts-ignore - web-only inline styles with animated styles
			style={
				{
					flex: 1,
					fontSize: 16,
					fontWeight: 500,
					color: theme.colors.major,
					paddingBlock: 0,
					outline: 'none',
					minHeight: 22,
					wordBreak: 'break-word',
					...style
				} as React.CSSProperties
			}
		/>
	)
}
