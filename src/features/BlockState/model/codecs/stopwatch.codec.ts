import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type StopwatchState = { durationMs: number }

export const stopwatchCodecV1: BlockStateCodec<StopwatchState> = {
	version: 1,
	encode: (state) => pack([state.durationMs]),
	decode: (bytes) => {
		const [durationMs] = unpack(bytes) as [number]
		return { durationMs }
	}
}
