import type { StopwatchBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

export const stopwatchSettingsCodecV1: BlockSettingsCodec<StopwatchBlockSettings> =
	{
		version: 1,
		encode: (settings) => [
			settings.checkable ?? false,
			settings.journaled ?? false,
			settings.duration ?? 0
		],
		decode: ([checkable, journaled, duration]) => ({
			checkable: Boolean(checkable),
			journaled: Boolean(journaled),
			duration: Number(duration ?? 0)
		})
	}
