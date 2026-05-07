import { and, eq, gte, inArray, isNull, like, lte, sql } from 'drizzle-orm'

import { db } from '@/services/database/client'
import {
	categories,
	schedules,
	states,
	tasks
} from '@/services/database/schema'
import { TaskId } from '@/shared/domain/ids'
import { TaskEntity, TaskRow } from '@/shared/domain/task'
import { TaskFilters } from '../model/task.types'

const makeTaskObject = (task: TaskRow): TaskEntity => ({
	id: task.id,
	info: task.info,
	status: task.status,
	state: task.states?.[0]?.state ?? null,
	priority: task.priority,
	category: task.category,
	parent_id: task.parent_id,
	schedules: task.schedules,
	created_at: task.created_at,
	updated_at: task.updated_at
})

const buildTaskMap = (
	rows: {
		task: typeof tasks.$inferSelect
		schedule: typeof schedules.$inferSelect | null
		state: typeof states.$inferSelect | null
		category: typeof categories.$inferSelect | null
	}[]
): Map<string, TaskRow> => {
	const map = new Map<string, TaskRow>()

	for (const row of rows) {
		const existing = map.get(row.task.id)

		if (!existing) {
			map.set(row.task.id, {
				id: row.task.id,
				info: row.task.info,
				status: row.task.status,
				priority: row.task.priority ?? null,
				parent_id: row.task.parent_id ?? null,
				category: row.category
					? {
							id: row.category.id,
							name: row.category.name,
							parent_id: row.category.parent_id ?? null
						}
					: null,
				schedules: row.schedule ? [row.schedule] : [],
				states: row.state
					? [
							{
								...row.state,
								created_at: row.state.created_at ?? new Date().toISOString()
							}
						]
					: [],
				created_at: row.task.created_at,
				updated_at: row.task.updated_at ?? null
			})
		} else {
			if (row.schedule && row.schedule.id) {
				const exists = existing.schedules.some((s) => s.id === row.schedule!.id)
				if (!exists) {
					existing.schedules.push(row.schedule!)
				}
			}
			if (row.state && row.state.id) {
				const exists = existing.states.some((s) => s.id === row.state!.id)
				if (!exists) {
					existing.states.push({
						...row.state!,
						created_at: row.state!.created_at ?? new Date().toISOString()
					})
				}
			}
		}
	}

	return map
}

const fetchTasksWithRelations = async (
	whereClause?: ReturnType<typeof and>,
	orderByClause?: string
) => {
	const query = db
		.select({
			task: tasks,
			schedule: schedules,
			state: states,
			category: categories
		})
		.from(tasks)
		.leftJoin(schedules, eq(tasks.id, schedules.task_id))
		.leftJoin(states, eq(tasks.id, states.task_id))
		.leftJoin(categories, eq(tasks.category_id, categories.id))

	if (whereClause) {
		query.where(whereClause)
	}

	if (orderByClause) {
		query.orderBy(sql.raw(orderByClause))
	}

	const rows = await query
	return Array.from(buildTaskMap(rows).values())
}

export const taskRepository = {
	async getTasks(filters?: TaskFilters): Promise<TaskEntity[]> {
		const conditions: (
			| ReturnType<typeof eq>
			| ReturnType<typeof isNull>
			| ReturnType<typeof like>
			| ReturnType<typeof inArray>
		)[] = [isNull(tasks.parent_id)]

		if (filters?.categoryId) {
			const categoryIds = Array.isArray(filters.categoryId)
				? filters.categoryId
				: [filters.categoryId]

			if (categoryIds.includes('uncategorized')) {
				conditions.push(isNull(tasks.category_id))
			} else {
				const validIds = categoryIds.filter((id) => id !== 'uncategorized')
				if (validIds.length > 0) {
					conditions.push(inArray(tasks.category_id, validIds))
				}
			}
		}

		if (filters?.status) {
			conditions.push(eq(tasks.status, filters.status))
		}

		if (filters?.priority !== undefined) {
			conditions.push(eq(tasks.priority, filters.priority))
		}

		if (filters?.searchQuery) {
			conditions.push(like(tasks.info, `%${filters.searchQuery}%`))
		}

		const result = await fetchTasksWithRelations(
			and(...conditions),
			`${tasks.created_at} DESC`
		)
		return result.map(makeTaskObject)
	},

	async getAllTasks(): Promise<TaskEntity[]> {
		const result = await fetchTasksWithRelations(
			undefined,
			`${tasks.created_at} DESC`
		)
		return result.map(makeTaskObject)
	},

	async getTasksByDate(date: string): Promise<TaskEntity[]> {
		const allTasks = await fetchTasksWithRelations()

		return allTasks
			.filter((task) => {
				return task.schedules?.some((schedule) => {
					if (schedule.date === date) return true
					if (schedule.start_date && schedule.end_date) {
						return date >= schedule.start_date && date <= schedule.end_date
					}
					return false
				})
			})
			.map(makeTaskObject)
	},

	async getTaskSubtasks(taskId: TaskId): Promise<TaskEntity[]> {
		const result = await fetchTasksWithRelations(
			eq(tasks.parent_id, taskId),
			`${tasks.created_at} ASC`
		)
		return result.map(makeTaskObject)
	},

	async getTasksCountByPeriod(
		startDate: string,
		endDate: string
	): Promise<Record<string, number>> {
		const rows = await db
			.select()
			.from(schedules)
			.where(and(gte(schedules.date, startDate), lte(schedules.date, endDate)))

		const countByDate: Record<string, number> = {}
		rows.forEach((schedule) => {
			if (schedule.date) {
				countByDate[schedule.date] = (countByDate[schedule.date] || 0) + 1
			}
		})

		return countByDate
	},

	async getTaskById(taskId: TaskId): Promise<TaskEntity | null> {
		const result = await fetchTasksWithRelations(eq(tasks.id, taskId))
		if (result.length === 0) return null
		return makeTaskObject(result[0])
	},

	async createTask(info: string): Promise<TaskEntity> {
		const now = new Date().toISOString()
		const id = crypto.randomUUID()

		await db.insert(tasks).values({
			id,
			info,
			status: 'active',
			created_at: now
		})

		const result = await fetchTasksWithRelations(eq(tasks.id, id))
		if (result.length === 0) throw new Error('Failed to create task')
		return makeTaskObject(result[0])
	},

	async updateTaskState(
		taskId: TaskId,
		state: 'done' | 'active' | 'archived'
	): Promise<TaskEntity> {
		const existing = await db
			.select()
			.from(states)
			.where(eq(states.task_id, taskId))
			.limit(1)

		const now = new Date().toISOString()

		if (existing.length > 0) {
			await db
				.update(states)
				.set({ state, state_date: now })
				.where(eq(states.id, existing[0].id))
		} else {
			await db.insert(states).values({
				id: crypto.randomUUID(),
				task_id: taskId,
				state,
				state_date: now,
				created_at: now
			})
		}

		const result = await fetchTasksWithRelations(eq(tasks.id, taskId))
		if (result.length === 0)
			throw new Error('Task not found after state update')
		return makeTaskObject(result[0])
	}
}
