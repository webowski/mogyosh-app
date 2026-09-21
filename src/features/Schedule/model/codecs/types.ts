import type { ScheduleData } from '@/shared/domain/task'

export interface ScheduleCodec {
	version: number
	encode(data: ScheduleData): Uint8Array
	decode(bytes: Uint8Array, version: number): ScheduleData
}
