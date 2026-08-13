import type { RefObject } from 'react'
import { create } from 'zustand'

type CounterAccessoryStore = {
	isActive: boolean
	// Identifies which field's focus session is currently "current".
	// A blur handler compares its own captured token against this value
	// after a delay — if it still matches, no newer focus event (same
	// field refocusing or another field taking over) has happened since,
	// so it's safe to deactivate.
	activeToken: symbol | null
	activate: (token: symbol) => void
	deactivate: (token: symbol) => void

	stepHandlerRef: RefObject<((step: number) => void) | null>
}

export const useCounterAccessoryStore = create<CounterAccessoryStore>(
	(set, get) => ({
		isActive: false,
		activeToken: null,

		activate: (token: symbol) => set({ isActive: true, activeToken: token }),

		deactivate: (token: symbol) => {
			if (get().activeToken !== token) return
			set({ isActive: false, activeToken: null })
		},

		stepHandlerRef: { current: null }
	})
)
