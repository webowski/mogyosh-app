import { scheduleCodecV1 } from './schedule.codec'
import type { ScheduleCodec } from './types'

const CODEC_REGISTRY = new Map<number, ScheduleCodec>([[1, scheduleCodecV1]])

export const getLatestScheduleCodec = (): ScheduleCodec => {
	const latestVersion = Math.max(...CODEC_REGISTRY.keys())
	return CODEC_REGISTRY.get(latestVersion)!
}

export const getScheduleCodecByVersion = (version: number): ScheduleCodec => {
	const codec = CODEC_REGISTRY.get(version)
	if (!codec) {
		throw new Error(`No schedule codec for version ${version}`)
	}
	return codec
}
