import type { RefObject } from 'react'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { KeyboardEvents } from 'react-native-keyboard-controller'

interface BlurableInstance {
	blur: () => void
}

// Android does not blur the focused input when the keyboard is dismissed
// via the back button or swipe gesture, leaving a blinking cursor on a
// field while the keyboard is actually closed. This hook forces a blur
// whenever the native keyboard hides, so the cursor only ever shows while
// the keyboard is open.
export function useBlurOnKeyboardHide(
	ref: RefObject<BlurableInstance | null> | null | undefined
) {
	useEffect(() => {
		if (Platform.OS === 'web') return

		const subscription = KeyboardEvents.addListener('keyboardDidHide', () => {
			ref?.current?.blur()
		})

		return () => subscription.remove()
	}, [ref])
}
