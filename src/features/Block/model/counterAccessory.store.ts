import type { RefObject } from 'react'
import { create } from 'zustand'

type CounterAccessoryStore = {
	isActive: boolean
	setActive: (isActive: boolean) => void

	// Holds the currently focused CounterBlock's step handler so the
	// globally-mounted CounterKeyboardAccessory can trigger it.
	stepHandlerRef: RefObject<((step: number) => void) | null>
}

export const useCounterAccessoryStore = create<CounterAccessoryStore>(
	(set) => ({
		isActive: false,
		setActive: (isActive: boolean) => set({ isActive }),

		stepHandlerRef: { current: null }
	})
)
