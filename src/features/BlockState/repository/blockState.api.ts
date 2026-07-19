import { supabaseClient } from '@/shared/api/supabaseClient'
import type { BlockId } from '@/shared/domain/ids'
import {
	getCodecByVersion,
	getLatestCodec,
	type BlockType
} from '../model/codecs/registry'
import { getMonthStart, readDayPayload } from '../model/dayLayout'

type SetBlockDayStateParams<TState> = {
	blockId: BlockId
	blockType: BlockType
	date: Date
	state: TState
}

/**
 * Encodes one day's block state client-side and sends only that day's payload
 * to the RPC — the server splices it into the existing month bytea without
 * touching the other 30 days. The client never sends the full month state.
 */
export const setBlockDayState = async <TState>({
	blockId,
	blockType,
	date,
	state
}: SetBlockDayStateParams<TState>): Promise<void> => {
	const codec = getLatestCodec<TState>(blockType)
	const encodedState = codec.encode(state)

	// Prefix the payload with the codec version so decode() knows which codec to use later,
	// independent of block_states.encoding (which only versions the offsets-table layout)
	const dayPayload = new Uint8Array(1 + encodedState.length)
	dayPayload[0] = codec.version
	dayPayload.set(encodedState, 1)

	const { error } = await supabaseClient.rpc('set_block_day_state', {
		p_block_id: blockId,
		p_month: getMonthStart(date),
		p_day_of_month: date.getDate(),
		p_day_payload: dayPayload
	})

	if (error) throw error
}

/**
 * Decodes a specific day's state out of an already-fetched month bytea.
 * Returns null when no state has been recorded for that day yet.
 */
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
