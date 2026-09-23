import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type { ScheduleData } from '@/shared/domain/task'

import { expandNotificationFireDates } from './expandFireDates'
import { getAndroidChannelId, requestNotificationPermissions } from './setup'

const NOTIFICATION_ID_PREFIX = 'mog:task:'

const buildNotificationId = (
	taskId: string,
	kind: 'start' | 'before',
	occurrenceAt: Date
): string => {
	const year = occurrenceAt.getFullYear()
	const month = String(occurrenceAt.getMonth() + 1).padStart(2, '0')
	const day = String(occurrenceAt.getDate()).padStart(2, '0')
	const hour = String(occurrenceAt.getHours()).padStart(2, '0')
	const minute = String(occurrenceAt.getMinutes()).padStart(2, '0')
	return `${NOTIFICATION_ID_PREFIX}${taskId}:${kind}:${year}-${month}-${day}T${hour}:${minute}`
}

const formatMinutesBeforeLabel = (minutes: number): string => {
	if (minutes < 60) return `через ${minutes} мин`
	if (minutes === 60) return 'через 1 час'
	if (minutes % 1440 === 0) {
		const days = minutes / 1440
		return days === 1 ? 'через 1 день' : `через ${days} дн`
	}
	const hours = Math.round(minutes / 60)
	return `через ${hours} ч`
}

export const cancelTaskNotifications = async (
	taskId: string
): Promise<void> => {
	if (Platform.OS === 'web') return

	const prefix = `${NOTIFICATION_ID_PREFIX}${taskId}:`
	const scheduled = await Notifications.getAllScheduledNotificationsAsync()

	await Promise.all(
		scheduled
			.filter((item) => item.identifier.startsWith(prefix))
			.map((item) =>
				Notifications.cancelScheduledNotificationAsync(item.identifier)
			)
	)
}

type RescheduleParams = {
	taskId: string
	title: string
	scheduleData: ScheduleData | null | undefined
}

/**
 * Cancels previous notifications for the task and schedules new ones
 * based on scheduleData.notification (horizon ~30 days).
 */
export const rescheduleTaskNotifications = async ({
	taskId,
	title,
	scheduleData
}: RescheduleParams): Promise<void> => {
	if (Platform.OS === 'web') return

	await cancelTaskNotifications(taskId)

	if (!scheduleData?.notification) return

	const hasPermission = await requestNotificationPermissions()
	if (!hasPermission) return

	const fireList = expandNotificationFireDates(scheduleData)
	const channelId = getAndroidChannelId()

	for (const fire of fireList) {
		const identifier = buildNotificationId(taskId, fire.kind, fire.occurrenceAt)

		const body =
			fire.kind === 'start'
				? 'Время выполнить задачу'
				: fire.minutesBefore !== null
					? `Начало ${formatMinutesBeforeLabel(fire.minutesBefore)}`
					: 'Напоминание о задаче'

		await Notifications.scheduleNotificationAsync({
			identifier,
			content: {
				title,
				body,
				data: {
					taskId,
					kind: fire.kind,
					url: '/task'
				},
				sound: true,
				...(Platform.OS === 'android' ? { channelId } : {})
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DATE,
				date: fire.fireAt
			}
		})
	}
}

/**
 * Re-schedules notifications for many tasks (e.g. on app start).
 */
export const resyncAllTaskNotifications = async (
	tasks: {
		id: string
		title: string
		scheduleData: ScheduleData | null | undefined
	}[]
): Promise<void> => {
	if (Platform.OS === 'web') return

	const hasPermission = await requestNotificationPermissions()
	if (!hasPermission) return

	for (const task of tasks) {
		await rescheduleTaskNotifications({
			taskId: task.id,
			title: task.title,
			scheduleData: task.scheduleData
		})
	}
}
