import Animated, {
	measure,
	runOnUI,
	useAnimatedRef,
	useAnimatedScrollHandler
} from 'react-native-reanimated'

import { useDragSortContext } from './DragSortContext'

export function useDragSortScroll() {
	const { state } = useDragSortContext()
	const scrollAnimatedRef = useAnimatedRef<Animated.ScrollView>()

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			state.scrollY.value = event.contentOffset.y
		}
	})

	const measureContainer = () => {
		runOnUI(() => {
			'worklet'
			const measured = measure(scrollAnimatedRef)
			if (measured) {
				state.containerPageY.value = measured.pageY
			}
		})()
	}

	return { scrollAnimatedRef, scrollHandler, measureContainer }
}
