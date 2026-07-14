import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import { TEXT_VARS } from '@/shared/styles/text'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { MaterialIcons } from '@expo/vector-icons'
import { useSubitemLogic } from '../model/useSubitemLogic'
import { subitemStyles } from '../style'

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

type ExpandableHeadingSubitemProps = SubitemProps & {
	variant: ExpandableHeadingVariant
	inputRefs?: SubitemInputRefsMap
	onExpandToggle: (expanded: boolean) => void
}

export default function ExpandableHeadingSubitem({
	variant,
	inputRefs,
	data,
	pendingFocusId,
	onCheckToggle,
	onAddAfter,
	onRemove,
	onExpandToggle
}: ExpandableHeadingSubitemProps) {
	const {
		inputRef,
		checked,
		checkedStyle,
		handleChangeText,
		handlePressCheckbox,
		handleFocus,
		handleAddAfter
	} = useSubitemLogic({
		data,
		onCheckToggle,
		inputRefs,
		onAddAfter,
		pendingFocusId,
		subitemType: variant
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
		<View style={subitemStyles.Expandible}>
			<Pressable
				onPress={toggleExpand}
				style={{ marginRight: 4, marginTop: 2 }}
			>
				<Animated.View style={animatedIconStyle}>
					<MaterialIcons
						name='play-arrow'
						size={16}
						color={theme.colors.major}
					/>
				</Animated.View>
			</Pressable>
			<MarkdownInput
				ref={inputRef}
				subitemText={data.text_content}
				style={[{ flex: 1 }, checkedStyle]}
				textStyle={subitemStyles.heading(HEADING_SIZES[variant])}
				onChangeMarkdown={handleChangeText}
				onEnterPress={handleAddAfter}
				onFocus={handleFocus}
				onBackspaceOnEmpty={() => {
					onRemove?.()
				}}
			/>
			{data.settings?.checkable && (
				<Checkbox
					style={subitemStyles.Block__checkbox}
					checked={checked}
					onPress={handlePressCheckbox}
				/>
			)}
		</View>
	)
}
