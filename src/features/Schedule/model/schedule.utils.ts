import type { ScheduleData } from '@/shared/domain/task'

const toDateString = (date: Date): string => {
	return date.toISOString().slice(0, 10)
}

const parseLocalDate = (dateString: string): Date => {
	const [year, month, day] = dateString.split('-').map(Number)
	return new Date(year, month - 1, day)
}

const isWithinRange = (
	dateString: string,
	startDate?: string,
	endDate?: string
): boolean => {
	if (startDate && dateString < startDate) return false
	if (endDate && dateString > endDate) return false
	return true
}

/**
 * Returns all scheduled time points for a specific date.
 * Empty array = not scheduled that day (or fully excepted).
 */
export const getScheduleTimesForDate = (
	data: ScheduleData,
	dateString: string
): { time: string | null; endTime?: string | null }[] => {
	if (data.exceptions.includes(dateString)) {
		return []
	}

	const date = parseLocalDate(dateString)
	const rule = data.rule

	switch (rule.type) {
		case 'once': {
			return rule.occurrences
				.filter((occurrence) => occurrence.date === dateString)
				.map((occurrence) => ({
					time: occurrence.time,
					endTime: occurrence.endTime
				}))
		}

		case 'daily': {
			if (!isWithinRange(dateString, rule.startDate, rule.endDate)) {
				return []
			}
			if (rule.times.length === 0) {
				return [{ time: null }]
			}
			return rule.times.map((slot) => ({
				time: slot.time,
				endTime: slot.endTime
			}))
		}

		case 'weekly': {
			if (!isWithinRange(dateString, rule.startDate, rule.endDate)) {
				return []
			}
			const weekday = date.getDay() // 0=Sun … 6=Sat, local, без UTC-сдвига
			return rule.slots
				.filter((slot) => slot.weekday === weekday)
				.map((slot) => ({
					time: slot.time,
					endTime: slot.endTime
				}))
		}

		case 'monthly': {
			if (!isWithinRange(dateString, rule.startDate, rule.endDate)) {
				return []
			}
			const dayOfMonth = date.getDate()
			return rule.occurrences
				.filter((occurrence) => occurrence.dayOfMonth === dayOfMonth)
				.map((occurrence) => ({
					time: occurrence.time,
					endTime: occurrence.endTime
				}))
		}

		case 'yearly': {
			if (!isWithinRange(dateString, rule.startDate, rule.endDate)) {
				return []
			}
			const month = date.getMonth() + 1
			const day = date.getDate()
			return rule.occurrences
				.filter(
					(occurrence) => occurrence.month === month && occurrence.day === day
				)
				.map((occurrence) => ({
					time: occurrence.time,
					endTime: occurrence.endTime
				}))
		}

		default:
			return []
	}
}

export const isScheduledOnDate = (
	data: ScheduleData,
	dateString: string
): boolean => {
	return getScheduleTimesForDate(data, dateString).length > 0
}

export const addException = (
	data: ScheduleData,
	dateString: string
): ScheduleData => {
	if (data.exceptions.includes(dateString)) {
		return data
	}
	return {
		...data,
		exceptions: [...data.exceptions, dateString].sort()
	}
}

export const removeException = (
	data: ScheduleData,
	dateString: string
): ScheduleData => {
	return {
		...data,
		exceptions: data.exceptions.filter(
			(exceptionDate) => exceptionDate !== dateString
		)
	}
}
