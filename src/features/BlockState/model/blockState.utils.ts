import type { BlockMonthStateEntity } from '@/shared/domain/block'
import { getBlockDayState } from '../repository/blockState.api'
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
