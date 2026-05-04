import { createClient } from '@supabase/supabase-js'
import 'expo-sqlite/localStorage/install'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
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
	}
})
