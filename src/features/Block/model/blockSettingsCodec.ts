import { pack, unpack } from 'msgpackr'

import {
	bytesToHex,
	parseByteaHex
} from '@/features/BlockState/model/dayLayout'
import type { BlockSettings, BlockType } from '@/shared/domain/block'
import {
	getLatestSettingsCodec,
	getSettingsCodecByVersion
} from './settingsCodecs/registry'

/**
 * Encodes block settings as a positional MessagePack array (no field names stored),
 * prefixed with the codec version, then as a Postgres hex string for the bytea column.
 */
export const encodeBlockSettingsToHex = (
	blockType: BlockType,
	settings: BlockSettings
): string => {
	const codec = getLatestSettingsCodec<BlockSettings>(blockType)
	const tuple = codec.encode(settings)
	const encoded = pack(tuple)

	const payload = new Uint8Array(1 + encoded.length)
	payload[0] = codec.version
	payload.set(encoded, 1)

	return `\\x${bytesToHex(payload)}`
}

/**
 * Decodes block settings from the hex-encoded bytea value returned by Supabase.
 * The decode side is chosen by block.type, matching the codec used to encode it.
 */
export const decodeBlockSettingsFromHex = (
	blockType: BlockType,
	hex: string | null | undefined
): BlockSettings => {
	const bytes = parseByteaHex(hex)
	if (bytes.length === 0) return {}

	const version = bytes[0]
	const tuple = unpack(bytes.slice(1)) as unknown[]
	const codec = getSettingsCodecByVersion<BlockSettings>(blockType, version)

	return codec.decode(tuple)
}
