import Animated, {
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

	return { scrollAnimatedRef, scrollHandler }
}
