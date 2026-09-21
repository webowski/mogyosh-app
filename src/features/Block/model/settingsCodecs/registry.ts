import type { BlockType } from '@/shared/domain/block'
import { counterSettingsCodecV1 } from './counterSettings.codec'
import { defaultSettingsCodecV1 } from './defaultSettings.codec'
import { stopwatchSettingsCodecV1 } from './stopwatchSettings.codec'
import { timerSettingsCodecV1 } from './timerSettings.codec'
import type { BlockSettingsCodec } from './types'

const DEFAULT_CODEC_TYPES: BlockType[] = [
	'p',
	'h1',
	'h2',
	'h3',
	'h4',
	'ul',
	'ol',
	'e',
	'h1e',
	'h2e',
	'h3e',
	'h4e',
	'tbl',
	'pr',
	'img'
]

const CODEC_REGISTRY = new Map<
	BlockType,
	Map<number, BlockSettingsCodec<unknown>>
>([
	...DEFAULT_CODEC_TYPES.map(
		(type) =>
			[
				type,
				new Map([[1, defaultSettingsCodecV1 as BlockSettingsCodec<unknown>]])
			] as const
	),
	['t', new Map([[1, timerSettingsCodecV1 as BlockSettingsCodec<unknown>]])],
	[
		'sw',
		new Map([[1, stopwatchSettingsCodecV1 as BlockSettingsCodec<unknown>]])
	],
	['c', new Map([[1, counterSettingsCodecV1 as BlockSettingsCodec<unknown>]])]
])

export const getLatestSettingsCodec = <TSettings>(
	blockType: BlockType
): BlockSettingsCodec<TSettings> => {
	const versions = CODEC_REGISTRY.get(blockType) ?? CODEC_REGISTRY.get('p')
	if (!versions)
		throw new Error(`No settings codec registered for block type: ${blockType}`)

	const latestVersion = Math.max(...versions.keys())
	return versions.get(latestVersion) as BlockSettingsCodec<TSettings>
}

export const getSettingsCodecByVersion = <TSettings>(
	blockType: BlockType,
	version: number
): BlockSettingsCodec<TSettings> => {
	const versions = CODEC_REGISTRY.get(blockType) ?? CODEC_REGISTRY.get('p')
	const codec = versions?.get(version)

	if (!codec) {
		throw new Error(
			`No settings codec for block type "${blockType}" version ${version}`
		)
	}

	return codec as BlockSettingsCodec<TSettings>
}
