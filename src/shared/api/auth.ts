import { supabaseClient } from './supabaseClient'

const testUserEmail = process.env.EXPO_PUBLIC_TEST_USER_EMAIL!
const testUserPassord = process.env.EXPO_PUBLIC_TEST_USER_PASSWORD!

export const login = async () => {
	const { data, error } = await supabaseClient.auth.signInWithPassword({
		email: testUserEmail,
		password: testUserPassord
	})

	if (error) throw error
	return data
}
