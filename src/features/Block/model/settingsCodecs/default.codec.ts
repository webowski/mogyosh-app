import type { CommonBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

export const defaultSettingsCodecV1: BlockSettingsCodec<CommonBlockSettings> = {
	version: 1,
	encode: (settings) => [
		settings.checkable ?? false,
		settings.journaled ?? false,
		settings.in_stats ?? false
	],
	decode: ([checkable, journaled, inStats]) => ({
		checkable: Boolean(checkable),
		journaled: Boolean(journaled),
		in_stats: Boolean(inStats)
	})
}
