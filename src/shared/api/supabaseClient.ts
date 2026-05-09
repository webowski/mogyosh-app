import { createClient } from '@supabase/supabase-js'
import { createMMKV } from 'react-native-mmkv'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing Supabase environment variables. Please check your .env.local file.'
	)
}

const mmkv = createMMKV({ id: 'supabase.auth' })

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
	}
})
