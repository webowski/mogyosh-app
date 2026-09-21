import type { SchedulePayload } from '@/shared/domain/task'
import { pack, unpack } from 'msgpackr'
import type { ScheduleCodec } from './types'

/**
 * V1 layout (msgpack):
 * [rule, exceptions]
 *
 * rule is stored as plain object matching ScheduleRule shape.
 */
export const scheduleCodecV1: ScheduleCodec = {
	version: 1,
	encode: (payload) => pack([payload.rule, payload.exceptions]),
	decode: (bytes) => {
		const [rule, exceptions] = unpack(bytes) as [
			SchedulePayload['rule'],
			string[]
		]
		return {
			rule,
			exceptions: exceptions ?? []
		}
	}
}
