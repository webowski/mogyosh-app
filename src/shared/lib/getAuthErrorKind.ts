export type AuthErrorKind = 'network' | 'credentials' | 'rateLimit' | 'unknown'

// export const getAuthErrorKind = (error: unknown): AuthErrorKind => {
// 	if (isAuthRetryableFetchError(error)) return 'network'
// 	if (isAuthApiError(error)) return 'credentials'
//
// 	return 'unknown'
// }

export function getAuthErrorKind(error: unknown): AuthErrorKind {
	console.log('AUTH ERROR RAW:', error)

	if (error instanceof Error) {
		console.log('AUTH ERROR message:', error.message)
		const message = error.message.toLowerCase()

		if (
			message.includes('network') ||
			message.includes('fetch') ||
			message.includes('failed to fetch')
		) {
			return 'network'
		}

		if (
			message.includes('rate limit') ||
			message.includes('email rate limit exceeded')
		) {
			return 'rateLimit'
		}

		if (
			message.includes('invalid') ||
			message.includes('credentials') ||
			message.includes('oauth')
		) {
			return 'credentials'
		}
	}

	return 'unknown'
}
