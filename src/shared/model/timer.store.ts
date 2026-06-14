import { create } from 'zustand'

import type { SubitemId } from '@/shared/domain/ids'

type TimerEntry = {
	isRunning: boolean
	remainingMs: number
	startedAt: number | null
}

type TimerStore = {
	entries: Map<SubitemId, TimerEntry>
	start: (id: SubitemId, durationMs: number) => void
	pause: (id: SubitemId) => void
	reset: (id: SubitemId, durationMs: number) => void
	getRemaining: (id: SubitemId, durationMs: number) => number
}

export const useTimerStore = create<TimerStore>((set, get) => ({
	entries: new Map(),

	start: (id, durationMs) => {
		const entries = new Map(get().entries)
		const existing = entries.get(id)
		// If finished or missing — restart from full duration
		const remainingMs =
			existing && existing.remainingMs > 0 ? existing.remainingMs : durationMs
		entries.set(id, { isRunning: true, remainingMs, startedAt: Date.now() })
		set({ entries })
	},

	pause: (id) => {
		const entries = new Map(get().entries)
		const entry = entries.get(id)
		if (!entry?.isRunning || entry.startedAt === null) return
		const elapsed = Date.now() - entry.startedAt
		const remainingMs = Math.max(0, entry.remainingMs - elapsed)
		entries.set(id, {
			...entry,
			isRunning: false,
			remainingMs,
			startedAt: null
		})
		set({ entries })
	},

	reset: (id, durationMs) => {
		const entries = new Map(get().entries)
		entries.set(id, {
			isRunning: false,
			remainingMs: durationMs,
			startedAt: null
		})
		set({ entries })
	},

	getRemaining: (id, durationMs) => {
		const entry = get().entries.get(id)
		if (!entry) return durationMs
		if (!entry.isRunning || entry.startedAt === null) return entry.remainingMs
		return Math.max(0, entry.remainingMs - (Date.now() - entry.startedAt))
	}
}))
