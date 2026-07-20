import type { TimerBlockSettings } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

const MODE_CODE = { increasing: 0, decreasing: 1 } as const
const MODE_FROM_CODE: Record<number, TimerBlockSettings['mode']> = {
	0: 'increasing',
	1: 'decreasing'
}

export const timerSettingsCodecV1: BlockSettingsCodec<TimerBlockSettings> = {
	version: 1,
	encode: (settings) => [
		settings.checkable ?? false,
		settings.journaled ?? false,
		settings.duration ?? 0,
		MODE_CODE[settings.mode ?? 'increasing']
	],
	decode: ([checkable, journaled, duration, modeCode]) => ({
		checkable: Boolean(checkable),
		journaled: Boolean(journaled),
		duration: Number(duration ?? 0),
		mode: MODE_FROM_CODE[Number(modeCode ?? 0)]
	})
}
