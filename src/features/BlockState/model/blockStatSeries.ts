import type { BlockEntity } from '@/shared/domain/block'
import { getStatValueFromDayState } from './blockStatValue'
import { parseByteaHex } from './dayLayout'

export const getBlockStatSeries = (
	block: Pick<BlockEntity, 'type' | 'states' | 'settings'>
): { date: Date; value: number }[] => {
	if (!block.settings?.in_stats) return []

	const series: { date: Date; value: number }[] = []

	for (const monthState of block.states ?? []) {
		if (monthState.month === null) continue
		const monthBytes = parseByteaHex(monthState.state)
		const [year, month] = monthState.month.split('-').map(Number)

		for (let dayOfMonth = 1; dayOfMonth <= 31; dayOfMonth++) {
			const value = getStatValueFromDayState(block.type, monthBytes, dayOfMonth)
			if (value !== null) {
				series.push({
					date: new Date(Date.UTC(year, month - 1, dayOfMonth)),
					value
				})
			}
		}
	}

	return series.sort(
		(first, second) => first.date.getTime() - second.date.getTime()
	)
}
