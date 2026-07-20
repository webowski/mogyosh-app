import type { CounterBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

export const counterSettingsCodecV1: BlockSettingsCodec<CounterBlockSettings> =
	{
		version: 1,
		encode: (settings) => [
			settings.checkable ?? false,
			settings.journaled ?? false,
			settings.goal ?? 0,
			settings.start ?? 0,
			settings.units ?? ''
		],
		decode: ([checkable, journaled, goal, start, units]) => ({
			checkable: Boolean(checkable),
			journaled: Boolean(journaled),
			goal: Number(goal ?? 0),
			start: Number(start ?? 0),
			units: String(units ?? '')
		})
	}
