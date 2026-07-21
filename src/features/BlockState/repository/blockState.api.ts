import { supabaseClient } from '@/shared/api/supabaseClient'
import type { BlockId } from '@/shared/domain/ids'
import {
	getCodecByVersion,
	getLatestCodec,
	type BlockType
} from '../model/codecs/registry'
import {
	bytesToHex,
	getMonthStart,
	parseByteaHex,
	readDayPayload
} from '../model/dayLayout'

type SetBlockDayStateParams<TState> = {
	blockId: BlockId
	blockType: BlockType
	date: Date
	state: TState
}

export const setBlockDayState = async <TState>({
	blockId,
	blockType,
	date,
	state
}: SetBlockDayStateParams<TState>): Promise<void> => {
	const codec = getLatestCodec<TState>(blockType)
	const encodedState = codec.encode(state)

	const dayPayload = new Uint8Array(1 + encodedState.length)
	dayPayload[0] = codec.version
	dayPayload.set(encodedState, 1)

	const { error } = await supabaseClient.rpc('set_block_day_state', {
		p_block_id: blockId,
		p_month: getMonthStart(date),
		p_day_of_month: date.getDate(),
		p_day_payload_hex: bytesToHex(dayPayload)
	})

	if (error) throw error
}

export const getBlockDayState = <TState>(
	blockType: BlockType,
	monthBytes: Uint8Array,
	dayOfMonth: number
): TState | null => {
	const dayPayload = readDayPayload(monthBytes, dayOfMonth)
	if (!dayPayload) return null

	const codecVersion = dayPayload[0]
	const encodedState = dayPayload.slice(1)
	const codec = getCodecByVersion<TState>(blockType, codecVersion)

	return codec.decode(encodedState, codecVersion)
}

type SetBlockPersistentStateParams<TState> = {
	blockId: BlockId
	blockType: BlockType
	state: TState
}

/**
 * Sets a block's persistent ("сквозной") state — a single value with no date
 * dimension, stored as the block_states row where month IS NULL.
 */
export const setBlockPersistentState = async <TState>({
	blockId,
	blockType,
	state
}: SetBlockPersistentStateParams<TState>): Promise<void> => {
	const codec = getLatestCodec<TState>(blockType)
	const encodedState = codec.encode(state)

	const payload = new Uint8Array(1 + encodedState.length)
	payload[0] = codec.version
	payload.set(encodedState, 1)

	const { error } = await supabaseClient.rpc('set_block_persistent_state', {
		p_block_id: blockId,
		p_state_payload_hex: bytesToHex(payload)
	})

	if (error) throw error
}

/**
 * Decodes a single-value state payload (persistent, no day/offsets framing) —
 * used for the month = NULL row instead of getBlockDayState's bitmap extraction.
 */
export const decodeBlockStatePayload = <TState>(
	blockType: BlockType,
	hex: string | null | undefined
): TState | null => {
	const bytes = parseByteaHex(hex)
	if (bytes.length === 0) return null

	const codecVersion = bytes[0]
	const encodedState = bytes.slice(1)
	const codec = getCodecByVersion<TState>(blockType, codecVersion)

	return codec.decode(encodedState, codecVersion)
}
