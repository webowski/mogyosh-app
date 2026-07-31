import { checkboxCodecV1 } from './checkbox.codec'
import { counterCodecV1 } from './counter.codec'
import { timerCodecV1 } from './timer.codec'
import type { BlockStateCodec } from './types'

export type BlockStateCodecKind = 'checkbox' | 'counter' | 'timer'

/**
 * Maps block type + version -> codec. Adding a new block type or bumping a
 * version means adding an entry here — no table or migration changes needed.
 */
const CODEC_REGISTRY = new Map<
	BlockStateCodecKind,
	Map<number, BlockStateCodec<unknown>>
>([
	['checkbox', new Map([[1, checkboxCodecV1 as BlockStateCodec<unknown>]])],
	['counter', new Map([[1, counterCodecV1 as BlockStateCodec<unknown>]])],
	['timer', new Map([[1, timerCodecV1 as BlockStateCodec<unknown>]])]
])

/** Always encode with the highest registered version for a block type */
export const getLatestCodec = <TState>(
	blockStateCodec: BlockStateCodecKind
): BlockStateCodec<TState> => {
	const versions = CODEC_REGISTRY.get(blockStateCodec)
	if (!versions)
		throw new Error(`No codec registered for block type: ${blockStateCodec}`)

	const latestVersion = Math.max(...versions.keys())
	return versions.get(latestVersion) as BlockStateCodec<TState>
}

export const getCodecByVersion = <TState>(
	blockStateCodec: BlockStateCodecKind,
	version: number
): BlockStateCodec<TState> => {
	const codec = CODEC_REGISTRY.get(blockStateCodec)?.get(version)
	if (!codec) {
		throw new Error(
			`No codec for block type "${blockStateCodec}" version ${version}`
		)
	}
	return codec as BlockStateCodec<TState>
}
