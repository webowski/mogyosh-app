import type { CommonBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

export const defaultSettingsCodecV1: BlockSettingsCodec<CommonBlockSettings> = {
	version: 1,
	encode: (settings) => [
		settings.checkable ?? false,
		settings.journaled ?? false
	],
	decode: ([checkable, journaled]) => ({
		checkable: Boolean(checkable),
		journaled: Boolean(journaled)
	})
}
