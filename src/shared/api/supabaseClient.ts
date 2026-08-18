import { createClient } from '@supabase/supabase-js'
import { createMMKV } from 'react-native-mmkv'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing Supabase environment variables. Please check your .env.local file.'
	)
}

const mmkv = createMMKV({ id: 'supabase.auth' })

// ─── Fetch with timeout ─────────────────────────────────────────────────────
// Prevents auth/network errors from hanging on OS-level TCP timeout (can exceed 60s on Android)

const FETCH_TIMEOUT_MS = 10_000

const fetchWithTimeout: typeof fetch = (input, init) => {
	const abortController = new AbortController()
	const timeoutId = setTimeout(() => abortController.abort(), FETCH_TIMEOUT_MS)

	return fetch(input, { ...init, signal: abortController.signal }).finally(
		() => {
			clearTimeout(timeoutId)
		}
	)
}

const localStorage = {
	getItem: (key: string) => mmkv.getString(key) ?? null,
	setItem: (key: string, value: string) => {
		mmkv.set(key, value)
	},
	removeItem: (key: string) => {
		mmkv.remove(key)
	}
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: localStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false
	},
	global: {
		fetch: fetchWithTimeout
	}
})
