import type { StopwatchBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

export const stopwatchSettingsCodecV1: BlockSettingsCodec<StopwatchBlockSettings> =
	{
		version: 1,
		encode: (settings) => [
			settings.checkable ?? false,
			settings.journaled ?? false,
			settings.in_stats ?? false,
			settings.duration ?? 0
		],
		decode: ([checkable, journaled, inStats, duration]) => ({
			checkable: Boolean(checkable),
			journaled: Boolean(journaled),
			in_stats: Boolean(inStats),
			duration: Number(duration ?? 0)
		})
	}
