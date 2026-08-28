import type { TimerBlockSettings, TimerDirection } from '@/shared/domain/block'
import type { BlockSettingsCodec } from './types'

const DIRECTION_CODE: Record<TimerDirection, number> = {
	increasing: 0,
	decreasing: 1
}
const DIRECTION_FROM_CODE: Record<number, TimerDirection> = {
	0: 'increasing',
	1: 'decreasing'
}

export const timerSettingsCodecV1: BlockSettingsCodec<TimerBlockSettings> = {
	version: 1,
	encode: (settings) => [
		settings.checkable ?? false,
		settings.journaled ?? false,
		settings.in_stats ?? false,
		settings.duration ?? 0,
		DIRECTION_CODE[settings.timerDirection ?? 'increasing']
	],
	decode: ([checkable, journaled, inStats, duration, directionCode]) => ({
		checkable: Boolean(checkable),
		journaled: Boolean(journaled),
		in_stats: Boolean(inStats),
		duration: Number(duration ?? 0),
		timerDirection: DIRECTION_FROM_CODE[Number(directionCode ?? 0)]
	})
}
