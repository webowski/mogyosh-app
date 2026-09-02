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
// Switching focus directly from block A to block B also fires
// "keyboardDidHide" for A as part of the native transition, immediately
// followed by block B's own focus (which reopens the keyboard). Blurring
// blindly on every hide event would end up blurring B right after it
// gained focus, since the store's focusedBlockId already points at B by
// the time the hide callback runs.
//
// To tell the two cases apart deterministically (no timing guesses),
// capture which block was focused AT THE MOMENT the hide event fired and
// re-check it on the next tick. If focus already moved to a different
// block by then (a synchronous part of the same native transaction),
// the hide was just that transition's artifact — skip it, that other
// block owns its own state. Only if the SAME block is still focused do we
// treat the hide as a genuine, standalone dismiss and blur it.
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

		const hideSubscription = KeyboardEvents.addListener(
			'keyboardDidHide',
			() => {
				if (pendingHideTimeoutId) clearTimeout(pendingHideTimeoutId)

				const focusedBlockIdAtHideTime = getFocusedBlockId()
				pendingHideTimeoutId = setTimeout(() => {
					pendingHideTimeoutId = null
					if (!focusedBlockIdAtHideTime) return
					if (getFocusedBlockId() !== focusedBlockIdAtHideTime) return
					inputRefs.get(focusedBlockIdAtHideTime)?.current?.blur()
				}, 0)
			}
		)

		return () => {
			if (pendingHideTimeoutId) clearTimeout(pendingHideTimeoutId)
			hideSubscription.remove()
		}
	}, [inputRefs, getFocusedBlockId])
}
