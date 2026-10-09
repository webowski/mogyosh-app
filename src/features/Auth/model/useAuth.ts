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
import {
	type AuthErrorKind,
	getAuthErrorKind
} from '@/shared/lib/getAuthErrorKind'
import { Alert } from 'react-native'

export function useAuth() {
	const [session, setSession] = useState<Session | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [errorKind, setErrorKind] = useState<AuthErrorKind | null>(null)

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
		const isAuthCallbackUrl = (url: string) => {
			// Ignore expo-development-client and similar launch URLs
			if (url.includes('expo-development-client')) {
				return false
			}
			// Only process URLs that look like OAuth / magic-link callbacks
			return (
				url.includes('access_token=') ||
				url.includes('refresh_token=') ||
				url.includes('code=') ||
				url.includes('error=')
			)
		}

		const handleUrl = async (url: string | null) => {
			if (!url) return
			if (!isAuthCallbackUrl(url)) return

			try {
				await createSessionFromUrl(url)
			} catch (error) {
				Alert.alert(
					'Deep link auth error',
					String(error instanceof Error ? error.message : error)
				)
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
