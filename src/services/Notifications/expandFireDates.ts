import { getScheduleTimesForDate } from '@/features/Schedule/model/schedule.utils'
import type { ScheduleData } from '@/shared/domain/task'

export type NotificationFire = {
	fireAt: Date
	occurrenceAt: Date
	kind: 'start' | 'before'
	minutesBefore: number | null
}

const toDateString = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const combineDateAndTime = (dateString: string, time: string): Date => {
	const [year, month, day] = dateString.split('-').map(Number)
	const [hour, minute] = time.split(':').map(Number)
	return new Date(year, month - 1, day, hour, minute, 0, 0)
}

/**
 * Builds concrete fire timestamps for the next horizonDays.
 * Only slots with concrete time are included.
 */
export const expandNotificationFireDates = (
	scheduleData: ScheduleData,
	options?: { from?: Date; horizonDays?: number }
): NotificationFire[] => {
	const notification = scheduleData.notification
	if (!notification) return []

	const hasAdvance =
		notification.minutesBefore !== null && notification.minutesBefore > 0
	const hasAtStart = notification.notifyAtStart === true
	if (!hasAdvance && !hasAtStart) return []

	const from = options?.from ?? new Date()
	const horizonDays = options?.horizonDays ?? 30
	const nowMs = from.getTime()
	const result: NotificationFire[] = []

	for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset++) {
		const dayDate = new Date(
			from.getFullYear(),
			from.getMonth(),
			from.getDate() + dayOffset
		)
		const dateString = toDateString(dayDate)
		const slots = getScheduleTimesForDate(scheduleData, dateString)

		for (const slot of slots) {
			if (!slot.time) continue

			const occurrenceAt = combineDateAndTime(dateString, slot.time)

			if (hasAtStart && occurrenceAt.getTime() > nowMs) {
				result.push({
					fireAt: occurrenceAt,
					occurrenceAt,
					kind: 'start',
					minutesBefore: null
				})
			}

			if (hasAdvance && notification.minutesBefore !== null) {
				const fireAt = new Date(
					occurrenceAt.getTime() - notification.minutesBefore * 60_000
				)
				if (fireAt.getTime() > nowMs) {
					result.push({
						fireAt,
						occurrenceAt,
						kind: 'before',
						minutesBefore: notification.minutesBefore
					})
				}
			}
		}
	}

	return result
}
