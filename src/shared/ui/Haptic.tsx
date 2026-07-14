import * as Haptics from 'expo-haptics'

export const triggerHapticLight = () => {
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}
