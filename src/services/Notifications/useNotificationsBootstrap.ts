import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'

import { useAuth } from '@/features/Auth/model/useAuth'
import { useTasks } from '@/features/TaskList'

import {
	configureNotificationHandler,
	requestNotificationPermissions,
	resyncAllTaskNotifications
} from './index'

/**
 * Configures handler, requests permissions, resyncs scheduled notifications
 * for tasks with schedule, and handles notification taps.
 */
export const useNotificationsBootstrap = () => {
	const { isAuthenticated } = useAuth()
	const { data: tasks = [] } = useTasks()
	const router = useRouter()

	useEffect(() => {
		if (Platform.OS === 'web') return

		configureNotificationHandler()
		void requestNotificationPermissions()
	}, [])

	useEffect(() => {
		if (Platform.OS === 'web') return
		if (!isAuthenticated) return
		if (tasks.length === 0) return

		const payload = tasks
			.filter((task) => task.schedule?.schedule)
			.map((task) => ({
				id: task.id,
				title: task.title,
				scheduleData: task.schedule?.schedule ?? null
			}))

		void resyncAllTaskNotifications(payload)
	}, [isAuthenticated, tasks])

	useEffect(() => {
		if (Platform.OS === 'web') return

		const redirect = (notification: Notifications.Notification) => {
			const taskId = notification.request.content.data?.taskId
			if (typeof taskId === 'string') {
				// Adjust to your task-open flow if needed
				router.push('/task')
			}
		}

		const lastResponse = Notifications.getLastNotificationResponse()
		if (lastResponse?.notification) {
			redirect(lastResponse.notification)
		}

		const subscription = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				redirect(response.notification)
			}
		)

		return () => {
			subscription.remove()
		}
	}, [router])
}
