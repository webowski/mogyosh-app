const LAYOUT_VERSION = 1
const DAYS_PER_MONTH_SLOTS = 31
const HEADER_SIZE = 1
const OFFSET_TABLE_SIZE = DAYS_PER_MONTH_SLOTS * 2
const PAYLOAD_START = HEADER_SIZE + OFFSET_TABLE_SIZE

/**
 * Decodes the raw month bytea into per-day payload slices without touching
 * the msgpack contents — used to extract a single day's bytes for the codec layer.
 */
export const readDayPayload = (
	monthBytes: Uint8Array,
	dayOfMonth: number
): Uint8Array | null => {
	if (monthBytes.length === 0) return null

	const dayIndex = dayOfMonth - 1
	const view = new DataView(
		monthBytes.buffer,
		monthBytes.byteOffset,
		monthBytes.byteLength
	)

	let payloadOffset = PAYLOAD_START
	for (let currentDay = 0; currentDay < dayIndex; currentDay++) {
		payloadOffset += view.getUint16(HEADER_SIZE + currentDay * 2, true)
	}

	const length = view.getUint16(HEADER_SIZE + dayIndex * 2, true)
	if (length === 0) return null

	return monthBytes.slice(payloadOffset, payloadOffset + length)
}

/**
 * Rebuilds the month bytea with one day's payload replaced, preserving all other days untouched.
 * This mirrors exactly what the Postgres RPC does server-side — kept here only for local
 * optimistic-update previews, the source of truth write always goes through the RPC.
 */
export const writeDayPayload = (
	monthBytes: Uint8Array,
	dayOfMonth: number,
	newPayload: Uint8Array
): Uint8Array => {
	const lengths: number[] = []
	const payloads: Uint8Array[] = []

	for (let day = 1; day <= DAYS_PER_MONTH_SLOTS; day++) {
		if (day === dayOfMonth) {
			lengths.push(newPayload.length)
			payloads.push(newPayload)
			continue
		}

		const existing =
			monthBytes.length > 0 ? readDayPayload(monthBytes, day) : null
		lengths.push(existing?.length ?? 0)
		payloads.push(existing ?? new Uint8Array(0))
	}

	const totalPayloadLength = payloads.reduce(
		(sum, payload) => sum + payload.length,
		0
	)
	const result = new Uint8Array(PAYLOAD_START + totalPayloadLength)
	const view = new DataView(result.buffer)

	result[0] = LAYOUT_VERSION
	let writeOffset = PAYLOAD_START

	for (let day = 0; day < DAYS_PER_MONTH_SLOTS; day++) {
		view.setUint16(HEADER_SIZE + day * 2, lengths[day], true)
		result.set(payloads[day], writeOffset)
		writeOffset += lengths[day]
	}

	return result
}
