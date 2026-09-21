import type { SchedulePayload } from '@/shared/domain/task'

const toDateString = (date: Date): string => {
	return date.toISOString().slice(0, 10)
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
	payload: SchedulePayload,
	dateString: string
): { time: string | null; endTime?: string | null }[] => {
	if (payload.exceptions.includes(dateString)) {
		return []
	}

	const date = new Date(dateString + 'T00:00:00')
	const rule = payload.rule

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
			return rule.times.map((slot) => ({
				time: slot.time,
				endTime: slot.endTime
			}))
		}

		case 'weekly': {
			if (!isWithinRange(dateString, rule.startDate, rule.endDate)) {
				return []
			}
			const weekday = date.getDay() // 0=Sun … 6=Sat
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
	payload: SchedulePayload,
	dateString: string
): boolean => {
	return getScheduleTimesForDate(payload, dateString).length > 0
}

export const addException = (
	payload: SchedulePayload,
	dateString: string
): SchedulePayload => {
	if (payload.exceptions.includes(dateString)) {
		return payload
	}
	return {
		...payload,
		exceptions: [...payload.exceptions, dateString].sort()
	}
}

export const removeException = (
	payload: SchedulePayload,
	dateString: string
): SchedulePayload => {
	return {
		...payload,
		exceptions: payload.exceptions.filter(
			(exceptionDate) => exceptionDate !== dateString
		)
	}
}
