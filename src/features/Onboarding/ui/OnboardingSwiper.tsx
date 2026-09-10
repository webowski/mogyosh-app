import { useWindowDimensions } from 'react-native'
import Animated, {
	useAnimatedScrollHandler,
	type SharedValue
} from 'react-native-reanimated'

import { ONBOARDING_SLIDES } from '../onboarding.constants'
import { OnboardingSlide } from './OnboardingSlide'

interface OnboardingSwiperProps {
	scrollOffset: SharedValue<number>
}

export function OnboardingSwiper({ scrollOffset }: OnboardingSwiperProps) {
	const { width } = useWindowDimensions()

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollOffset.value = event.contentOffset.x
		}
	})

	return (
		<Animated.ScrollView
			horizontal
			pagingEnabled
			showsHorizontalScrollIndicator={false}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			snapToInterval={width}
			disableIntervalMomentum
			decelerationRate='fast'
			overScrollMode='never'
		>
			{ONBOARDING_SLIDES.map((slide) => (
				<OnboardingSlide key={slide.id} slide={slide} />
			))}
		</Animated.ScrollView>
	)
}
