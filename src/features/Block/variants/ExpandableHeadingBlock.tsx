import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

import type { BlockInputRefsMap, BlockProps } from '@/shared/domain/block'
import { TEXT_VARS } from '@/shared/styles/text'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type ExpandableHeadingVariant =
	| 'expandable-h1'
	| 'expandable-h2'
	| 'expandable-h3'
	| 'expandable-h4'

const HEADING_SIZES: Record<ExpandableHeadingVariant, number> = {
	'expandable-h1': TEXT_VARS['h1'],
	'expandable-h2': TEXT_VARS['h2'],
	'expandable-h3': TEXT_VARS['h3'],
	'expandable-h4': TEXT_VARS['h4']
}

type ExpandableHeadingBlockProps = BlockProps & {
	variant: ExpandableHeadingVariant
	inputRefs?: BlockInputRefsMap
	onExpandToggle: (expanded: boolean) => void
}

export default function ExpandableHeadingBlock({
	variant,
	inputRefs,
	data,
	pendingFocusId,
	onCheckToggle,
	onAddAfter,
	onRemove,
	onExpandToggle
}: ExpandableHeadingBlockProps) {
	const {
		inputRef,
		checked,
		checkedStyle,
		handleChangeText,
		handlePressCheckbox,
		handleFocus,
		handleAddAfter
	} = useBlockLogic({
		data,
		onCheckToggle,
		inputRefs,
		onAddAfter,
		pendingFocusId,
		blockType: variant
	})
	const { theme } = useUnistyles()
	const rotationProgress = useSharedValue(1) // 1 = expanded (90deg), 0 = collapsed
	const [isExpanded, setIsExpanded] = useState(false)
	const animationProgress = useSharedValue(checked ? 1 : 0)

	useEffect(
		() => {
			animationProgress.value = withTiming(checked ? 1 : 0, { duration: 250 })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[checked]
	)

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotationProgress.value * 90}deg` }]
	}))

	const toggleExpand = () => {
		const nextExpanded = !isExpanded
		rotationProgress.value = withTiming(nextExpanded ? 1 : 0, { duration: 100 })
		setIsExpanded(nextExpanded)
		onExpandToggle(nextExpanded)
	}

	return (
		<View style={blockStyles.Expandible}>
			<Pressable
				onPress={toggleExpand}
				style={{ marginRight: 4, marginTop: 2 }}
			>
				<Animated.View style={animatedIconStyle}>
					<MaterialDesignIcons
						name='play'
						size={16}
						color={theme.colors.major}
					/>
				</Animated.View>
			</Pressable>
			<MarkdownInput
				ref={inputRef}
				blockText={data.text_content}
				style={[{ flex: 1 }, checkedStyle]}
				textStyle={blockStyles.heading(HEADING_SIZES[variant])}
				onChangeMarkdown={handleChangeText}
				onEnterPress={handleAddAfter}
				onFocus={handleFocus}
				onBackspaceOnEmpty={() => {
					onRemove?.()
				}}
			/>
			{data.settings?.checkable && (
				<Checkbox
					style={blockStyles.Block__checkbox}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
