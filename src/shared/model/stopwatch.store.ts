import { create } from 'zustand'

import type { SubitemId } from '@/shared/domain/ids'

type StopwatchEntry = {
	isRunning: boolean
	elapsedMs: number
	startedAt: number | null // timestamp when last started
}

type StopwatchStore = {
	entries: Map<SubitemId, StopwatchEntry>
	start: (id: SubitemId) => void
	pause: (id: SubitemId) => void
	reset: (id: SubitemId) => void
	getElapsed: (id: SubitemId) => number
}

const DEFAULT_ENTRY: StopwatchEntry = {
	isRunning: false,
	elapsedMs: 0,
	startedAt: null
}

export const useStopwatchStore = create<StopwatchStore>((set, get) => ({
	entries: new Map(),

	start: (id) => {
		const entries = new Map(get().entries)
		const entry = entries.get(id) ?? { ...DEFAULT_ENTRY }
		entries.set(id, { ...entry, isRunning: true, startedAt: Date.now() })
		set({ entries })
	},

	pause: (id) => {
		const entries = new Map(get().entries)
		const entry = entries.get(id)
		if (!entry?.isRunning || entry.startedAt === null) return
		const elapsed = entry.elapsedMs + (Date.now() - entry.startedAt)
		entries.set(id, {
			...entry,
			isRunning: false,
			elapsedMs: elapsed,
			startedAt: null
		})
		set({ entries })
	},

	reset: (id) => {
		const entries = new Map(get().entries)
		entries.set(id, { ...DEFAULT_ENTRY })
		set({ entries })
	},

	getElapsed: (id) => {
		const entry = get().entries.get(id)
		if (!entry) return 0
		if (!entry.isRunning || entry.startedAt === null) return entry.elapsedMs
		return entry.elapsedMs + (Date.now() - entry.startedAt)
	}
}))
