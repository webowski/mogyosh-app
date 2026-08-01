import { BlockType } from '@/shared/domain/block'
import { bulletedCodecV1 } from './bulleted.codec'
import { counterCodecV1 } from './counter.codec'
import { timerCodecV1 } from './timer.codec'
import type { BlockStateCodec } from './types'

/**
 * Maps block type + version -> codec. Adding a new block type or bumping a
 * version means adding an entry here — no table or migration changes needed.
 */
const CODEC_REGISTRY = new Map<
	BlockType,
	Map<number, BlockStateCodec<unknown>>
>([
	['ul', new Map([[1, bulletedCodecV1 as BlockStateCodec<unknown>]])],
	['counter', new Map([[1, counterCodecV1 as BlockStateCodec<unknown>]])],
	['timer', new Map([[1, timerCodecV1 as BlockStateCodec<unknown>]])]
])

/** Always encode with the highest registered version for a block type */
export const getLatestCodec = <TState>(
	blockType: BlockType
): BlockStateCodec<TState> => {
	const versions = CODEC_REGISTRY.get(blockType)
	if (!versions)
		throw new Error(`No codec registered for block type: ${blockType}`)

	const latestVersion = Math.max(...versions.keys())
	return versions.get(latestVersion) as BlockStateCodec<TState>
}

export const getCodecByVersion = <TState>(
	blockType: BlockType,
	version: number
): BlockStateCodec<TState> => {
	const codec = CODEC_REGISTRY.get(blockType)?.get(version)
	if (!codec) {
		throw new Error(`No codec for block type "${blockType}" version ${version}`)
	}
	return codec as BlockStateCodec<TState>
}
