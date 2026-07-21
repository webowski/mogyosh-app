import type { BlockMonthStateEntity } from '@/shared/domain/block'
import { BlockEntity } from '@/shared/domain/block'
import {
	decodeBlockStatePayload,
	getBlockDayState
} from '../repository/blockState.api'
import { getMonthStart, parseByteaHex } from './dayLayout'

/**
 * Checks whether a checkbox-type block is completed on a specific calendar day
 */
export const isBlockCompletedOnDate = (
	states: BlockMonthStateEntity[] | undefined,
	date: Date
): boolean => {
	if (!states || states.length === 0) return false

	const monthStart = getMonthStart(date)
	const monthState = states.find(
		(blockState) => blockState.month === monthStart
	)
	if (!monthState) return false

	const monthBytes = parseByteaHex(monthState.state)
	const completed = getBlockDayState<boolean>(
		'checkbox',
		monthBytes,
		date.getDate()
	)

	return completed ?? false
}

/**
 * Resolves a block's checked state.
 * Non-journaled ("сквозной"): reads the single persistent row (month = NULL), ignores the date.
 * Journaled ("несквозной"): reads the per-day bit from the matching month's bitmap.
 */
export const isBlockChecked = (
	block: Pick<BlockEntity, 'states' | 'settings'>,
	date: Date
): boolean => {
	const isJournaled = block.settings?.journaled ?? false

	if (!isJournaled) {
		const persistentState = block.states?.find((state) => state.month === null)
		if (!persistentState) return false

		return (
			decodeBlockStatePayload<boolean>('checkbox', persistentState.state) ??
			false
		)
	}

	return isBlockCompletedOnDate(block.states, date)
}
