import {
	isAuthApiError,
	isAuthRetryableFetchError
} from '@supabase/supabase-js'

export type AuthErrorKind = 'network' | 'credentials' | 'unknown'

export const getAuthErrorKind = (error: unknown): AuthErrorKind => {
	if (isAuthRetryableFetchError(error)) return 'network'
	if (isAuthApiError(error)) return 'credentials'

	return 'unknown'
}
