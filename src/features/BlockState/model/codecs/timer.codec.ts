import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type TimerState = { durationSeconds: number }

export const timerCodecV1: BlockStateCodec<TimerState> = {
	version: 1,
	encode: (state) => pack([state.durationSeconds]),
	decode: (bytes) => {
		const [durationSeconds] = unpack(bytes) as [number]
		return { durationSeconds }
	}
}
