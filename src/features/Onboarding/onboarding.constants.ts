export interface OnboardingSlideData {
	id: string
	titleKey: string
	descriptionKey: string
	// imageSource: ImageSourcePropType
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
	{
		id: 'slide-1',
		titleKey: 'onboarding.slide1.title',
		descriptionKey: 'onboarding.slide1.description'
		// imageSource: require('@/assets/onboarding/slide1.png')
	},
	{
		id: 'slide-2',
		titleKey: 'onboarding.slide2.title',
		descriptionKey: 'onboarding.slide2.description'
		// imageSource: require('@/assets/onboarding/slide2.png')
	},
	{
		id: 'slide-3',
		titleKey: 'onboarding.slide3.title',
		descriptionKey: 'onboarding.slide3.description'
		// imageSource: require('@/assets/onboarding/slide3.png')
	}
]
