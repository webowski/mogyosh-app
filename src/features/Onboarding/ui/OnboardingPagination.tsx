import { useWindowDimensions, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedStyle,
	type SharedValue
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { ONBOARDING_SLIDES } from '../onboarding.constants'

interface OnboardingPaginationProps {
	scrollOffset: SharedValue<number>
}

export function OnboardingPagination({
	scrollOffset
}: OnboardingPaginationProps) {
	const { width } = useWindowDimensions()

	return (
		<View style={styles.OnboardingPagination}>
			{ONBOARDING_SLIDES.map((slide, index) => (
				<OnboardingPaginationDot
					key={slide.id}
					index={index}
					scrollOffset={scrollOffset}
					slideWidth={width}
				/>
			))}
		</View>
	)
}

interface OnboardingPaginationDotProps {
	index: number
	slideWidth: number
	scrollOffset: SharedValue<number>
}

function OnboardingPaginationDot({
	index,
	slideWidth,
	scrollOffset
}: OnboardingPaginationDotProps) {
	const animatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * slideWidth,
			index * slideWidth,
			(index + 1) * slideWidth
		]

		const dotWidth = interpolate(
			scrollOffset.value,
			inputRange,
			[8, 24, 8],
			'clamp'
		)
		const dotOpacity = interpolate(
			scrollOffset.value,
			inputRange,
			[0.4, 1, 0.4],
			'clamp'
		)

		return {
			width: dotWidth,
			opacity: dotOpacity
		}
	})

	return (
		<Animated.View style={[styles.OnboardingPagination__dot, animatedStyle]} />
	)
}

const styles = StyleSheet.create((theme) => ({
	OnboardingPagination: {
		marginVertical: theme.spacing.md,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: theme.spacing.xs
	},
	OnboardingPagination__dot: {
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.primary
	}
}))
