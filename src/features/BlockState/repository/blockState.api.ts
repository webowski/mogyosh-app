import { supabaseClient } from '@/shared/api/supabaseClient'
import type { BlockId } from '@/shared/domain/ids'
import {
	getCodecByVersion,
	getLatestCodec,
	type BlockType
} from '../model/codecs/registry'
import { bytesToHex, getMonthStart, readDayPayload } from '../model/dayLayout'

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
