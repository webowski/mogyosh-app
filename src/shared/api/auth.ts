import { supabase } from './supabase'

const testUserEmail = process.env.EXPO_PUBLIC_TEST_USER_EMAIL!
const testUserPassord = process.env.EXPO_PUBLIC_TEST_USER_PASSWORD!

export const login = async () => {
	const { data, error } = await supabase.auth.signInWithPassword({
		email: testUserEmail,
		password: testUserPassord
	})

	if (error) throw error
	return data
}
