import { useEffect } from 'react'
import { Platform } from 'react-native'
import { KeyboardEvents } from 'react-native-keyboard-controller'

import type { BlockInputRefsMap } from '@/shared/domain/block'
import type { BlockId } from '@/shared/domain/ids'

// Android does not blur the focused input when the keyboard is dismissed
// via the back button or swipe gesture, leaving a blinking cursor on a
// field while the keyboard is actually closed. This hook forces a blur on
// the currently focused block's native input whenever the keyboard hides
// for real.
//
// Switching focus directly from block A to block B fires a genuine
// "keyboardDidHide" for A immediately followed by a genuine
// "keyboardDidShow" for B — the OS always sequences these in order, since
// it is the same underlying IME session. So instead of guessing from a
// possibly-stale visibility flag, we wait one runloop turn after a hide:
// if "keyboardDidShow" arrives in that window, the hide was just the
// native transition artifact of switching inputs and is ignored;
// otherwise the keyboard was genuinely dismissed and the currently
// focused block is blurred.
//
// Called ONCE for the whole editor (not per block) so there is a single
// source of truth for "which block is currently focused" instead of each
// block guessing about itself.
export function useBlurOnKeyboardHide(
	inputRefs: BlockInputRefsMap,
	getFocusedBlockId: () => BlockId | null
) {
	useEffect(() => {
		if (Platform.OS === 'web') return

		let pendingHideTimeoutId: ReturnType<typeof setTimeout> | null = null

		const clearPendingHide = () => {
			if (pendingHideTimeoutId) {
				clearTimeout(pendingHideTimeoutId)
				pendingHideTimeoutId = null
			}
		}

		const hideSubscription = KeyboardEvents.addListener(
			'keyboardDidHide',
			() => {
				clearPendingHide()
				pendingHideTimeoutId = setTimeout(() => {
					pendingHideTimeoutId = null
					const focusedBlockId = getFocusedBlockId()
					if (!focusedBlockId) return
					inputRefs.get(focusedBlockId)?.current?.blur()
				}, 0)
			}
		)

		// A genuine reopen (focus moved to another block) cancels the
		// pending blur, since the preceding hide was just a transition
		// artifact.
		const showSubscription = KeyboardEvents.addListener(
			'keyboardDidShow',
			clearPendingHide
		)

		return () => {
			clearPendingHide()
			hideSubscription.remove()
			showSubscription.remove()
		}
	}, [inputRefs, getFocusedBlockId])
}
