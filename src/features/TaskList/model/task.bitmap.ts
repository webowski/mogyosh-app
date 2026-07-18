/**
 * Bitmap utilities for the states.completed bytea column.
 * Bit 0 = day 1 of the month, bit 30 = day 31.
 */

/**
 * Reads a single day's completion bit from the bitmap.
 * completedBytes comes from Supabase as a hex string ("\\x0000...") or a plain byte array,
 * depending on the client — normalize before calling.
 */
export const isDayBitSet = (
	completedBytes: Uint8Array,
	dayOfMonth: number
): boolean => {
	const byteIndex = Math.floor((dayOfMonth - 1) / 8)
	const bitIndex = (dayOfMonth - 1) % 8

	if (byteIndex >= completedBytes.length) return false

	return (completedBytes[byteIndex] & (1 << bitIndex)) !== 0
}

/**
 * Supabase (PostgREST) returns bytea as a hex-encoded string like "\\x0000001f"
 */
export const parseByteaHex = (hex: string | null | undefined): Uint8Array => {
	if (!hex) return new Uint8Array(4)

	const cleanHex = hex.startsWith('\\x') ? hex.slice(2) : hex
	const bytes = new Uint8Array(cleanHex.length / 2)

	for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
		bytes[byteIndex] = parseInt(
			cleanHex.substring(byteIndex * 2, byteIndex * 2 + 2),
			16
		)
	}

	return bytes
}

export const getMonthStart = (date: Date): string => {
	return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1))
		.toISOString()
		.slice(0, 10)
}
