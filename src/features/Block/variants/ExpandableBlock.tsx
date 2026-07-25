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
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { useBlockLogic } from '../model/useBlockLogic'
import { blockStyles } from '../style'

type ExpandableBlockProps = BlockProps & {
	inputRefs?: BlockInputRefsMap
	onExpandToggle: (expanded: boolean) => void
}

export default function ExpandableBlock({
	inputRefs,
	data,
	pendingFocusId,
	onCheckToggle,
	onAddAfter,
	onRemove,
	onExpandToggle
}: ExpandableBlockProps) {
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
		blockType: 'expandable'
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
			<Pressable onPress={toggleExpand} style={blockStyles.Expandible__button}>
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
				textStyle={blockStyles.text}
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
					activeColor={
						data.settings?.journaled ? theme.colors.success : undefined
					}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
