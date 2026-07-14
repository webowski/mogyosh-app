import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

import type { SubitemInputRefsMap, SubitemProps } from '@/shared/domain/subitem'
import Checkbox from '@/shared/ui/Checkbox'
import { MarkdownInput } from '@/shared/ui/MarkdownInput'
import { MaterialIcons } from '@expo/vector-icons'
import { useSubitemLogic } from '../model/useSubitemLogic'
import { subitemStyles } from '../style'

type ExpandableSubitemProps = SubitemProps & {
	inputRefs?: SubitemInputRefsMap
	onExpandToggle: (expanded: boolean) => void
}

export default function ExpandableSubitem({
	inputRefs,
	data,
	pendingFocusId,
	onCheckToggle,
	onAddAfter,
	onRemove,
	onExpandToggle
}: ExpandableSubitemProps) {
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
		subitemType: 'expandable'
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
				subitemText={data.info}
				onChangeMarkdown={handleChangeText}
				onEnterPress={handleAddAfter}
				onFocus={handleFocus}
				style={[subitemStyles.text, checkedStyle]}
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
