import type { BlockType } from '@/shared/domain/block'
import { getBlockDayState } from '../repository/blockState.api'

/**
 * Reads the numeric "value" for a given day from the block's own decoded
 * state (whatever codec matches block.type) — used only for in_stats charts.
 */
export const getStatValueFromDayState = (
	blockType: BlockType,
	monthBytes: Uint8Array,
	dayOfMonth: number
): number | null => {
	const decoded = getBlockDayState<Record<string, unknown>>(
		blockType,
		monthBytes,
		dayOfMonth
	)
	if (decoded == null) return null

	const value = getStatFieldValue(blockType, decoded)
	return typeof value === 'number' ? value : null
}

const getStatFieldValue = (
	blockType: BlockType,
	decoded: Record<string, unknown>
): unknown => {
	switch (blockType) {
		case 'counter':
			return decoded.value
		case 'stopwatch':
			return decoded.durationMs
		case 'timer':
			return decoded.durationSeconds
		default:
			return decoded.value
	}
}
