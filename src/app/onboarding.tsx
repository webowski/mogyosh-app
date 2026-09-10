import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { useOnboardingStore } from '@/features/Onboarding/model/onboarding.store'
import { OnboardingPagination } from '@/features/Onboarding/ui/OnboardingPagination'
import { OnboardingSwiper } from '@/features/Onboarding/ui/OnboardingSwiper'
import { STYLE_VARS } from '@/shared/styles/common'
import { Button } from '@/shared/ui/Button'

export default function OnboardingScreen() {
	const insets = useSafeAreaInsets()
	const { t } = useTranslation()
	const scrollOffset = useSharedValue(0)
	const setOnboardingCompleted = useOnboardingStore(
		(state) => state.setOnboardingCompleted
	)

	const handleFinish = () => {
		setOnboardingCompleted()
	}

	return (
		<View
			style={[
				styles.OnboardingScreen,
				{
					paddingTop: insets.top + STYLE_VARS.sidePadding_sm,
					paddingBottom: insets.bottom
				}
			]}
		>
			<View style={styles.OnboardingScreen__topSection}>
				<Button variant='bare'>{t('screen.onboarding.Skip')}</Button>
			</View>
			<OnboardingSwiper scrollOffset={scrollOffset} />
			<OnboardingPagination scrollOffset={scrollOffset} />
			<Pressable style={styles.OnboardingScreen__button} onPress={handleFinish}>
				<Text style={styles.OnboardingScreen__buttonText}>Начать</Text>
			</Pressable>
		</View>
	)
}

const styles = StyleSheet.create((theme) => ({
	OnboardingScreen: {
		flex: 1,
		backgroundColor: theme.colors.surface
	},
	OnboardingScreen__topSection: {
		alignItems: 'flex-end',
		marginHorizontal: theme.spacing.lg
	},
	OnboardingScreen__button: {
		marginHorizontal: theme.spacing.lg,
		marginBottom: theme.spacing.md,
		paddingVertical: theme.spacing.md,
		borderRadius: STYLE_VARS.radius_sm,
		backgroundColor: theme.colors.primary,
		alignItems: 'center'
	},
	OnboardingScreen__buttonText: {
		color: theme.colors.inverse,
		fontSize: 16,
		fontWeight: '700' as const
	}
}))
