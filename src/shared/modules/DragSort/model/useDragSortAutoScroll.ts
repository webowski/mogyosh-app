import { Dimensions } from 'react-native'
import type Animated from 'react-native-reanimated'
import {
	scrollTo,
	useFrameCallback,
	type AnimatedRef
} from 'react-native-reanimated'

import {
	DRAG_SORT_AUTOSCROLL_EDGE,
	DRAG_SORT_AUTOSCROLL_SPEED
} from './dragSort.constants'
import { recomputeDragSortDropTarget } from './dragSort.utils'
import { useDragSortContext } from './DragSortContext'

export function useDragSortAutoScroll(
	scrollAnimatedRef: AnimatedRef<Animated.ScrollView>
) {
	const { state, indentStep } = useDragSortContext()
	const windowHeight = Dimensions.get('window').height

	useFrameCallback(() => {
		'worklet'
		if (!state.active.value) return

		const y = state.lastAbsoluteY.value
		if (y < DRAG_SORT_AUTOSCROLL_EDGE) {
			scrollTo(
				scrollAnimatedRef,
				0,
				state.scrollY.value - DRAG_SORT_AUTOSCROLL_SPEED,
				false
			)
		} else if (y > windowHeight - DRAG_SORT_AUTOSCROLL_EDGE) {
			scrollTo(
				scrollAnimatedRef,
				0,
				state.scrollY.value + DRAG_SORT_AUTOSCROLL_SPEED,
				false
			)
		}

		recomputeDragSortDropTarget(state, indentStep)
	})
}
