import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const ANDROID_CHANNEL_ID = 'task-reminders'

let isHandlerConfigured = false

export const configureNotificationHandler = () => {
	if (isHandlerConfigured) return
	isHandlerConfigured = true

	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldPlaySound: true,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true
		})
	})
}

export const ensureAndroidChannel = async () => {
	if (Platform.OS !== 'android') return

	await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
		name: 'Напоминания о задачах',
		importance: Notifications.AndroidImportance.HIGH,
		vibrationPattern: [0, 250, 250, 250],
		lightColor: '#668cff'
	})
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
	if (Platform.OS === 'web') return false

	await ensureAndroidChannel()

	const { status: existingStatus } = await Notifications.getPermissionsAsync()
	let finalStatus = existingStatus

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync()
		finalStatus = status
	}

	return finalStatus === 'granted'
}

export const getAndroidChannelId = () => ANDROID_CHANNEL_ID
