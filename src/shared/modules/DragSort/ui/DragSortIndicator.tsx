import type { StyleProp, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

import { useDragSortContext } from '../model/DragSortContext'

type DragSortIndicatorProps = {
	style?: StyleProp<ViewStyle>
}

export function DragSortIndicator({ style }: DragSortIndicatorProps) {
	const { state, indentStep } = useDragSortContext()
	const { theme } = useUnistyles()

	const indicatorStyle = useAnimatedStyle(() => {
		if (!state.active.value) return { opacity: 0 }

		const order = state.flatOrder.value
		const heights = state.rowHeights.value
		const dropIndex = state.dropIndex.value

		let cumulativeY = 0
		for (let i = 0; i < dropIndex && i < order.length; i++) {
			cumulativeY += heights[order[i].id] ?? 0
		}

		return {
			opacity: 1,
			transform: [
				{ translateY: cumulativeY - 1 },
				{ translateX: state.dropDepth.value * indentStep }
			]
		}
	})

	return (
		<Animated.View
			pointerEvents='none'
			style={[
				{
					position: 'absolute',
					zIndex: 20,
					left: 0,
					right: 0,
					height: 2,
					borderRadius: 1,
					backgroundColor: theme.colors.primarySubtle
				},
				indicatorStyle
			]}
		/>
	)
}
