import { createClient } from '@supabase/supabase-js'
import 'expo-sqlite/localStorage/install'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
	console.error(
		'Missing Supabase environment variables:',
		'EXPO_PUBLIC_SUPABASE_URL:',
		!!supabaseUrl,
		'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:',
		!!supabaseAnonKey
	)
	throw new Error(
		'Missing Supabase environment variables. Please check your .env.local file.'
	)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: localStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false
	},
	global: {
		fetch: async (url, options = {}) => {
			try {
				const response = await global.fetch(url, options)
				return response
			} catch (error) {
				console.error('Supabase fetch error:', {
					url,
					error: error instanceof Error ? error.message : error
				})
				throw error
			}
		}
	}
})
