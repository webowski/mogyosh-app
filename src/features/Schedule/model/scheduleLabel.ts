import type { ScheduleData } from '@/shared/domain/task'

const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

/**
 * Human-readable short label for chip / form row.
 */
export const formatScheduleLabel = (
	data: ScheduleData | null | undefined
): string => {
	if (!data) return 'Без повтора'

	const { rule } = data

	switch (rule.type) {
		case 'once': {
			if (rule.occurrences.length === 0) return 'Без повтора'
			if (rule.occurrences.length === 1) {
				const occurrence = rule.occurrences[0]
				return occurrence.time
					? `${occurrence.date} ${occurrence.time}`
					: occurrence.date
			}
			return `${rule.occurrences.length} дат`
		}

		case 'daily': {
			const times = rule.times
				.map((slot) => slot.time)
				.filter((time): time is string => Boolean(time))
			return times.length > 0 ? `Ежедневно ${times.join(', ')}` : 'Ежедневно'
		}

		case 'weekly': {
			if (rule.slots.length === 0) return 'Еженедельно'
			const byWeekday = new Map<number, string[]>()
			for (const slot of rule.slots) {
				const times = byWeekday.get(slot.weekday) ?? []
				if (slot.time) times.push(slot.time)
				byWeekday.set(slot.weekday, times)
			}
			const parts = [...byWeekday.entries()]
				.sort(([weekdayA], [weekdayB]) => weekdayA - weekdayB)
				.map(([weekday, times]) => {
					const dayLabel = WEEKDAY_SHORT[weekday] ?? String(weekday)
					return times.length > 0 ? `${dayLabel} ${times.join(', ')}` : dayLabel
				})
			return parts.join(' · ')
		}

		case 'monthly': {
			const days = rule.occurrences
				.map((occurrence) => occurrence.dayOfMonth)
				.sort((dayA, dayB) => dayA - dayB)
			return `Ежемесячно ${days.join(', ')}`
		}

		case 'yearly': {
			return `Ежегодно (${rule.occurrences.length})`
		}

		default:
			return 'Расписание'
	}
}
