import type { CounterBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

export const counterSettingsCodecV1: BlockSettingsCodec<CounterBlockSettings> =
	{
		version: 1,
		encode: (settings) => [
			settings.checkable ?? false,
			settings.journaled ?? false,
			settings.in_stats ?? false,
			settings.value ?? 0,
			settings.units ?? '',
			settings.start ?? 0,
			settings.goal ?? 0,
			settings.count ?? 0
		],
		decode: ([
			checkable,
			journaled,
			inStats,
			value,
			units,
			start,
			goal,
			count
		]) => ({
			checkable: Boolean(checkable),
			journaled: Boolean(journaled),
			in_stats: Boolean(inStats),
			value: Number(value ?? 0),
			units: String(units ?? ''),
			start: Number(start ?? 0),
			goal: Number(goal ?? 0),
			count: Number(count ?? 0)
		})
	}
