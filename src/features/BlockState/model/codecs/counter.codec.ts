import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type CounterState = {
	value: number
}

export const counterCodecV1: BlockStateCodec<CounterState> = {
	version: 1,
	encode: (state) => pack([state.value]),
	decode: (bytes) => {
		const [value] = unpack(bytes) as [number]
		return { value }
	}
}
