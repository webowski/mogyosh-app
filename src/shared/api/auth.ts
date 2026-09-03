import type { Provider } from '@supabase/supabase-js'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import * as WebBrowser from 'expo-web-browser'

import { supabaseClient } from './supabaseClient'

// const testUserEmail = process.env.EXPO_PUBLIC_TEST_USER_EMAIL!
// const testUserPassord = process.env.EXPO_PUBLIC_TEST_USER_PASSWORD!

// export const login = async () => {
// 	const { data, error } = await supabaseClient.auth.signInWithPassword({
// 		email: testUserEmail,
// 		password: testUserPassord
// 	})

// 	if (error) throw error
// 	return data
// }

WebBrowser.maybeCompleteAuthSession()

const redirectTo = makeRedirectUri()

export async function createSessionFromUrl(url: string) {
	const { params, errorCode } = QueryParams.getQueryParams(url)

	if (errorCode) throw new Error(errorCode)

	const { access_token, refresh_token } = params

	if (!access_token) return null

	const { data, error } = await supabaseClient.auth.setSession({
		access_token,
		refresh_token
	})

	if (error) throw error
	return data.session
}

export async function signInWithEmail(email: string) {
	const { error } = await supabaseClient.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: redirectTo
		}
	})

	if (error) throw error
}

async function signInWithOAuthProvider(provider: Provider) {
	const { data, error } = await supabaseClient.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo,
			skipBrowserRedirect: true
		}
	})

	if (error) throw error
	if (!data.url) throw new Error('No OAuth URL returned')

	const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

	if (result.type === 'success') {
		return createSessionFromUrl(result.url)
	}

	return null
}

export async function signInWithGoogle() {
	return signInWithOAuthProvider('google')
}

export async function signInWithYandex() {
	// Custom provider identifier from Supabase Dashboard
	return signInWithOAuthProvider('custom:yandex' as Provider)
}

export async function signOut() {
	const { error } = await supabaseClient.auth.signOut()
	if (error) throw error
}

export async function getSession() {
	const { data, error } = await supabaseClient.auth.getSession()
	if (error) throw error
	return data.session
}
