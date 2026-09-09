import { useTranslation } from 'react-i18next'
import { Text, View, useWindowDimensions } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import type { OnboardingSlideData } from '../onboarding.constants'

interface OnboardingSlideProps {
	slide: OnboardingSlideData
}

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
	const { width } = useWindowDimensions()
	const { t } = useTranslation()

	return (
		<View style={[styles.OnboardingSlide, { width }]}>
			{/* <Image
				source={slide.imageSource}
				style={styles.OnboardingSlide__image}
				resizeMode='contain'
			/> */}
			<Text style={styles.OnboardingSlide__title}>
				{t(`screen.${slide.titleKey}`)}
			</Text>
			<Text style={styles.OnboardingSlide__description}>
				{t(`screen.${slide.descriptionKey}`)}
			</Text>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	OnboardingSlide: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: theme.spacing.lg
	},
	OnboardingSlide__image: {
		width: '100%',
		height: 280,
		marginBottom: theme.spacing.xl
	},
	OnboardingSlide__title: {
		fontSize: 22,
		fontWeight: '700' as const,
		textAlign: 'center',
		marginBottom: theme.spacing.sm
	},
	OnboardingSlide__description: {
		fontSize: 15,
		textAlign: 'center',
		color: theme.colors.mutedText
	}
}))
