import type { RefObject } from 'react'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { KeyboardEvents } from 'react-native-keyboard-controller'

interface BlurableInstance {
	blur: () => void
}

// Tracks which native input instance most recently received focus, shared
// across every MarkdownInput mounted in the editor. Only that instance is
// allowed to blur itself when the keyboard hides. Without this guard, a
// stale "keyboardDidHide" fired while focus is transferring from block A to
// block B (a native transition artifact, not a real dismiss) would blur
// EVERY mounted block — including B, right as it gains focus — which
// cancels its focus and collapses the EditorToolbar.
let activeInstance: BlurableInstance | null = null

export function markActiveInputInstance(instance: BlurableInstance | null) {
	activeInstance = instance
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
			const instance = ref?.current
			if (!instance || instance !== activeInstance) return
			instance.blur()
			activeInstance = null
		})

		return () => subscription.remove()
	}, [ref])
}
