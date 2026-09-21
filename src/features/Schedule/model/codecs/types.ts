import type { SchedulePayload } from '@/shared/domain/task'

export interface ScheduleCodec {
	version: number
	encode(payload: SchedulePayload): Uint8Array
	decode(bytes: Uint8Array, version: number): SchedulePayload
}
