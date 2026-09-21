import type { ScheduleData } from '@/shared/domain/task'
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
	encode: (data) => pack([data.rule, data.exceptions]),
	decode: (bytes) => {
		const [rule, exceptions] = unpack(bytes) as [ScheduleData['rule'], string[]]
		return {
			rule,
			exceptions: exceptions ?? []
		}
	}
}
