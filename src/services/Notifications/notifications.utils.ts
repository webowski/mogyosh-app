import type { ScheduleData } from '@/shared/domain/task'

export const formatNotificationLabel = (data: ScheduleData | null): string => {
	if (!data?.notification) return 'Нет'

	const parts: string[] = []

	if (
		data.notification.minutesBefore !== null &&
		data.notification.minutesBefore > 0
	) {
		const minutes = data.notification.minutesBefore
		if (minutes < 60) {
			parts.push(`за ${minutes} мин`)
		} else if (minutes === 60) {
			parts.push('за 1 час')
		} else if (minutes === 1440) {
			parts.push('за 1 день')
		} else if (minutes % 1440 === 0) {
			parts.push(`за ${minutes / 1440} дн`)
		} else if (minutes % 60 === 0) {
			parts.push(`за ${minutes / 60} ч`)
		} else {
			parts.push(`за ${minutes} мин`)
		}
	}

	if (data.notification.notifyAtStart) {
		parts.push('в начале')
	}

	return parts.length > 0 ? parts.join(' · ') : 'Нет'
}
