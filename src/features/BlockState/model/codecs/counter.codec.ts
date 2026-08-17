import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type CounterState = {
	value: number
	completed?: boolean
}

export const counterCodecV1: BlockStateCodec<CounterState> = {
	version: 1,
	encode: (state) => pack([state.value, state.completed ?? false]),
	decode: (bytes) => {
		const [value, completed] = unpack(bytes) as [number, boolean]
		return { value, completed }
	}
}
