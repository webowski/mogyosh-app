import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import Animated, {
	useAnimatedScrollHandler,
	type SharedValue
} from 'react-native-reanimated'

import { ONBOARDING_SLIDES } from '../onboarding.constants'
import { OnboardingSlide } from './OnboardingSlide'

export interface OnboardingSwiperRef {
	scrollToIndex: (index: number) => void
}

interface OnboardingSwiperProps {
	scrollOffset: SharedValue<number>
}

export const OnboardingSwiper = forwardRef<
	OnboardingSwiperRef,
	OnboardingSwiperProps
>(({ scrollOffset }, ref) => {
	const { width } = useWindowDimensions()
	const scrollViewRef = useRef<Animated.ScrollView>(null)

	useImperativeHandle(ref, () => ({
		scrollToIndex: (index: number) => {
			scrollViewRef.current?.scrollTo({ x: index * width, animated: true })
		}
	}))

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollOffset.value = event.contentOffset.x
		}
	})

	return (
		<Animated.ScrollView
			ref={scrollViewRef}
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
})

OnboardingSwiper.displayName = 'OnboardingSwiper'
