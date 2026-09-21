import { supabaseClient } from '@/shared/api/supabaseClient'
import type { TaskId } from '@/shared/domain/ids'
import type { ScheduleData, ScheduleEntity } from '@/shared/domain/task'
import {
	getLatestScheduleCodec,
	getScheduleCodecByVersion
} from '../model/codecs/registry'
import { addException, removeException } from '../model/schedule.utils'

const parseByteaHex = (hex: string | null | undefined): Uint8Array => {
	if (!hex) return new Uint8Array(0)

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

const bytesToHex = (bytes: Uint8Array): string => {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
		''
	)
}

/** Raw row from Supabase (schedule column is hex-encoded bytea) */
type ScheduleRow = {
	task_id: string
	encoding: number
	schedule: string
	created_at: string
	updated_at: string
}

const decodeScheduleRow = (row: ScheduleRow): ScheduleEntity => {
	const codec = getScheduleCodecByVersion(row.encoding)
	const bytes = parseByteaHex(row.schedule)
	const scheduleData = codec.decode(bytes, row.encoding)

	return {
		taskId: row.task_id,
		encoding: row.encoding,
		schedule: scheduleData,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	}
}

/**
 * Decodes a nested schedules row coming from tasks select.
 * Returns null if row is missing or empty.
 */
export const decodeScheduleFromRow = (
	row: ScheduleRow | ScheduleRow[] | null | undefined
): ScheduleEntity | null => {
	if (!row) return null

	const scheduleRow = Array.isArray(row) ? row[0] : row
	if (!scheduleRow?.schedule) return null

	return decodeScheduleRow(scheduleRow)
}

const getScheduleByTaskId = async (
	taskId: TaskId
): Promise<ScheduleEntity | null> => {
	const { data, error } = await supabaseClient
		.from('schedules')
		.select('task_id, encoding, schedule, created_at, updated_at')
		.eq('task_id', taskId)
		.maybeSingle()

	if (error) throw error
	if (!data) return null

	return decodeScheduleRow(data as ScheduleRow)
}

type UpsertScheduleParams = {
	taskId: TaskId
	data: ScheduleData
}

/**
 * Creates or replaces the schedule rule for a task.
 */
const upsertSchedule = async ({
	taskId,
	data
}: UpsertScheduleParams): Promise<ScheduleEntity> => {
	const codec = getLatestScheduleCodec()
	const encoded = codec.encode(data)
	const scheduleHex = `\\x${bytesToHex(encoded)}`

	const { data: row, error } = await supabaseClient
		.from('schedules')
		.upsert(
			{
				task_id: taskId,
				encoding: codec.version,
				schedule: scheduleHex,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'task_id' }
		)
		.select('task_id, encoding, schedule, created_at, updated_at')
		.single()

	if (error) throw error

	return decodeScheduleRow(row as ScheduleRow)
}

const deleteSchedule = async (taskId: TaskId): Promise<void> => {
	const { error } = await supabaseClient
		.from('schedules')
		.delete()
		.eq('task_id', taskId)

	if (error) throw error
}

/**
 * Adds a date exception (skip whole day) and persists.
 */
const addScheduleException = async (
	taskId: TaskId,
	dateString: string
): Promise<ScheduleEntity> => {
	const existing = await getScheduleByTaskId(taskId)
	if (!existing) {
		throw new Error(`Schedule not found for task ${taskId}`)
	}

	const nextData = addException(existing.schedule, dateString)

	return upsertSchedule({ taskId, data: nextData })
}

/**
 * Removes a date exception and persists.
 */
const removeScheduleException = async (
	taskId: TaskId,
	dateString: string
): Promise<ScheduleEntity> => {
	const existing = await getScheduleByTaskId(taskId)
	if (!existing) {
		throw new Error(`Schedule not found for task ${taskId}`)
	}

	const nextData = removeException(existing.schedule, dateString)

	return upsertSchedule({ taskId, data: nextData })
}

export const scheduleAPI = {
	getScheduleByTaskId,
	upsertSchedule,
	deleteSchedule,
	addScheduleException,
	removeScheduleException,
	decodeScheduleFromRow
}
