import { forwardRef, useEffect, useRef } from 'react'
import {
	Platform,
	type StyleProp,
	type TextStyle,
	type ViewStyle
} from 'react-native'
import {
	EnrichedMarkdownTextInput,
	type EnrichedMarkdownTextInputInstance
} from 'react-native-enriched-markdown'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

interface MarkdownInputProps {
	blockText: string
	style?: StyleProp<AnimatedStyle<ViewStyle>>
	textStyle?: StyleProp<TextStyle>
	onChangeText?: (text: string) => void
	onChangeMarkdown?: (markdown: string) => void
	onEnterPress?: () => void
	onBackspaceOnEmpty?: () => void
	onFocus?: () => void
	onBlur?: () => void
}

export const MarkdownInput = forwardRef<
	EnrichedMarkdownTextInputInstance | HTMLDivElement,
	MarkdownInputProps
>(
	(
		{
			blockText,
			style,
			textStyle,
			onChangeText,
			onChangeMarkdown,
			onEnterPress,
			onBackspaceOnEmpty,
			onFocus,
			onBlur
		},
		ref
	) => {
		const { theme } = useUnistyles()
		const currentTextRef = useRef(blockText)

		if (Platform.OS === 'web') {
			return (
				<Animated.View style={style}>
					<WebDivInput
						divRef={ref as React.Ref<HTMLDivElement>}
						blockText={blockText}
						textStyle={textStyle}
						onChangeText={onChangeText}
						onEnterPress={onEnterPress}
						onBackspaceOnEmpty={onBackspaceOnEmpty}
						onFocus={onFocus}
					/>
				</Animated.View>
			)
		}

		return (
			<Animated.View style={style}>
				<EnrichedMarkdownTextInput
					ref={
						ref as unknown as React.RefObject<EnrichedMarkdownTextInputInstance>
					}
					style={StyleSheet.flatten([styles.Input, textStyle]) as TextStyle}
					defaultValue={blockText}
					placeholderTextColor={theme.colors.minor}
					scrollEnabled={false}
					multiline
					onFocus={onFocus}
					onKeyPress={(event) => {
						const { key } = event.nativeEvent
						console.log(event)
						if (key === 'Enter') {
							console.log('Enter')
							// ;(
							// 	ref as React.RefObject<EnrichedMarkdownTextInputInstance>
							// ).current?.setValue(blockText.trim())
							event.preventDefault()
							onEnterPress?.()
						} else if (key === 'Backspace' && currentTextRef.current === '') {
							onBackspaceOnEmpty?.()
						}
					}}
					onChangeText={(text) => {
						currentTextRef.current = text
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
	divRef: React.Ref<HTMLDivElement>
	blockText: string
	textStyle?: StyleProp<TextStyle>
	onChangeText?: (text: string) => void
	onEnterPress?: () => void
	onBackspaceOnEmpty?: () => void
	onFocus?: () => void
}

function WebDivInput({
	divRef,
	blockText,
	textStyle,
	onChangeText,
	onEnterPress,
	onBackspaceOnEmpty,
	onFocus
}: WebDivInputProps) {
	const { theme } = useUnistyles()
	const localRef = useRef<HTMLDivElement>(null)
	const resolvedRef = (divRef as React.RefObject<HTMLDivElement>) ?? localRef
	const flattenedTextStyle = StyleSheet.flatten(textStyle) as Record<
		string,
		unknown
	>

	useEffect(
		() => {
			if (resolvedRef.current) {
				resolvedRef.current.innerText = blockText
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
				fontWeight: '500',
				color: theme.colors.major,
				paddingBlock: 0,
				outline: 'none',
				minHeight: 22,
				wordBreak: 'break-word',
				...flattenedTextStyle
			}}
		/>
	)
}
