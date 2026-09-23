import type { ScheduleData } from '@/shared/domain/task'
import { pack, unpack } from 'msgpackr'
import type { ScheduleCodec } from './types'

/**
 * V1 layout (msgpack):
 * [rule, exceptions, notification?]
 *
 * rule is stored as plain object matching ScheduleRule shape.
 * notification is optional for backward compatibility.
 */
export const scheduleCodecV1: ScheduleCodec = {
	version: 1,
	encode: (data) =>
		pack([data.rule, data.exceptions, data.notification ?? null]),
	decode: (bytes) => {
		const unpacked = unpack(bytes) as [
			ScheduleData['rule'],
			string[],
			ScheduleData['notification']?
		]
		const [rule, exceptions, notification] = unpacked
		return {
			rule,
			exceptions: exceptions ?? [],
			notification: notification ?? null
		}
	}
}
