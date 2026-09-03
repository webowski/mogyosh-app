import type { Session } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'
import { useCallback, useEffect, useState } from 'react'

import {
	createSessionFromUrl,
	getSession,
	signInWithEmail,
	signInWithGoogle,
	signInWithYandex,
	signOut
} from '@/shared/api/auth'
import { supabaseClient } from '@/shared/api/supabaseClient'
import { getAuthErrorKind } from '@/shared/lib/getAuthErrorKind'
import { Alert } from 'react-native'

export function useAuth() {
	const [session, setSession] = useState<Session | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [errorKind, setErrorKind] = useState<
		'network' | 'credentials' | 'unknown' | null
	>(null)

	const refreshSession = useCallback(async () => {
		try {
			const currentSession = await getSession()
			console.log('SESSION', currentSession?.user?.email)
			// // временно, чтобы сбросить старую сессию:
			// if (currentSession) {
			// 	await signOut()
			// 	setSession(null)
			// 	return
			// }
			setSession(currentSession)
		} catch (error) {
			setErrorKind(getAuthErrorKind(error))
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		refreshSession()

		const {
			data: { subscription }
		} = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession)
			setIsLoading(false)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [refreshSession])

	// Deep link (magic link / OAuth callback)
	useEffect(() => {
		const handleUrl = async (url: string | null) => {
			if (!url) return
			try {
				await createSessionFromUrl(url)
			} catch (error) {
				setErrorKind(getAuthErrorKind(error))
			}
		}

		Linking.getInitialURL().then(handleUrl)

		const subscription = Linking.addEventListener('url', (event) => {
			handleUrl(event.url)
		})

		return () => subscription.remove()
	}, [])

	const loginWithEmail = async (email: string) => {
		setErrorKind(null)
		try {
			await signInWithEmail(email)
		} catch (error) {
			setErrorKind(getAuthErrorKind(error))
			throw error
		}
	}

	const loginWithGoogle = async () => {
		setErrorKind(null)
		try {
			await signInWithGoogle()
		} catch (error) {
			setErrorKind(getAuthErrorKind(error))
			throw error
		}
	}

	const loginWithYandex = async () => {
		setErrorKind(null)
		try {
			await signInWithYandex()
		} catch (error) {
			console.log('YANDEX AUTH ERROR:', error)
			Alert.alert(
				'Yandex auth error',
				String(error instanceof Error ? error.message : error)
			)
			setErrorKind(getAuthErrorKind(error))
			throw error
		}
	}

	const logout = async () => {
		await signOut()
		setSession(null)
	}

	return {
		session,
		isLoading,
		isAuthenticated: !!session,
		errorKind,
		loginWithEmail,
		loginWithGoogle,
		loginWithYandex,
		logout,
		refreshSession
	}
}
