import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type TextState = { completed: boolean }

/**
 * Encodes as a positional single-byte msgpack boolean — msgpackr already
 * produces a 1-byte payload for booleans, no custom bit-packing needed here.
 */

export const textCodecV1: BlockStateCodec<TextState> = {
	version: 1,
	encode: (state) => pack(state.completed),
	decode: (bytes) => ({ completed: unpack(bytes) as boolean })
}
