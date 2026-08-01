import { pack, unpack } from 'msgpackr'
import type { BlockStateCodec } from './types'

export type CheckableState = boolean

/**
 * Encodes as a positional single-byte msgpack boolean — msgpackr already
 * produces a 1-byte payload for booleans, no custom bit-packing needed here.
 */
export const bulletedCodecV1: BlockStateCodec<CheckableState> = {
	version: 1,
	encode: (state) => pack(state),
	decode: (bytes) => unpack(bytes) as CheckableState
}
