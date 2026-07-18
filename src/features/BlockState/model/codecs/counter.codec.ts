import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type CounterState = {
	repetitions: number
	weight: number
	unit: 'kg' | 'lb'
}

const UNIT_CODE: Record<CounterState['unit'], number> = { kg: 0, lb: 1 }
const UNIT_FROM_CODE: Record<number, CounterState['unit']> = {
	0: 'kg',
	1: 'lb'
}

/**
 * Encodes as a positional tuple [repetitions, weight, unitCode] instead of a keyed object —
 * avoids repeating field names ("repetitions", "weight", "unit") in every stored day.
 */
export const counterCodecV1: BlockStateCodec<CounterState> = {
	version: 1,
	encode: (state) =>
		pack([state.repetitions, state.weight, UNIT_CODE[state.unit]]),
	decode: (bytes) => {
		const [repetitions, weight, unitCode] = unpack(bytes) as [
			number,
			number,
			number
		]
		return { repetitions, weight, unit: UNIT_FROM_CODE[unitCode] }
	}
}
