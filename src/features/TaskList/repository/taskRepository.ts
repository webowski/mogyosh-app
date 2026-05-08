import {
	and,
	asc,
	desc,
	eq,
	gte,
	inArray,
	isNull,
	like,
	lte,
	or
} from 'drizzle-orm'
import { randomUUID } from 'expo-crypto'

import { db } from '@/services/database/client'
import {
	categoriesTable,
	schedulesTable,
	statesTable,
	tasksTable
} from '@/services/database/schema'
import type { TaskId } from '@/shared/domain/ids'
import type {
	ScheduleEntity,
	TaskEntity,
	TaskState
} from '@/shared/domain/task'
import type { TaskFilters } from '../model/task.types'

// Build TaskEntity from joined rows
const buildTaskEntity = (
	task: typeof tasksTable.$inferSelect,
	relations: {
		category?: typeof categoriesTable.$inferSelect | null
		schedules?: (typeof schedulesTable.$inferSelect)[]
		states?: (typeof statesTable.$inferSelect)[]
	}
): TaskEntity => ({
	id: task.id,
	info: task.info ?? '',
	status: task.status as TaskEntity['status'],
	state: (relations.states?.[0]?.state as TaskState) ?? null,
	priority: task.priority,
	category: relations.category ?? null,
	parent_id: task.parent_id,
	schedules: relations.schedules as unknown as ScheduleEntity[],
	created_at: task.created_at,
	updated_at: task.updated_at
})

const fetchRelations = async (taskIds: string[]) => {
	if (taskIds.length === 0) return { schedules: [], states: [], categories: [] }

	const [schedules, states] = await Promise.all([
		db
			.select()
			.from(schedulesTable)
			.where(inArray(schedulesTable.task_id, taskIds)),
		db.select().from(statesTable).where(inArray(statesTable.task_id, taskIds))
	])

	return { schedules, states }
}

export const taskRepository = {
	getAll: async (filters?: TaskFilters): Promise<TaskEntity[]> => {
		const conditions = [isNull(tasksTable.parent_id)]

		if (filters?.status) {
			conditions.push(eq(tasksTable.status, filters.status))
		}

		if (filters?.priority != null) {
			conditions.push(eq(tasksTable.priority, filters.priority))
		}

		if (filters?.searchQuery) {
			conditions.push(like(tasksTable.info, `%${filters.searchQuery}%`))
		}

		if (filters?.categoryId) {
			const ids = Array.isArray(filters.categoryId)
				? filters.categoryId
				: [filters.categoryId]
			const hasUncategorized = ids.includes('uncategorized')
			const validIds = ids.filter((id) => id !== 'uncategorized')

			if (hasUncategorized) {
				conditions.push(isNull(tasksTable.category_id))
			} else if (validIds.length > 0) {
				conditions.push(inArray(tasksTable.category_id, validIds))
			}
		}

		const tasks = await db
			.select()
			.from(tasksTable)
			.where(and(...conditions))
			.orderBy(desc(tasksTable.created_at))

		const taskIds = tasks.map((t) => t.id)
		const { schedules, states } = await fetchRelations(taskIds)

		const categories =
			tasks.filter((t) => t.category_id).length > 0
				? await db
						.select()
						.from(categoriesTable)
						.where(
							inArray(
								categoriesTable.id,
								tasks.map((t) => t.category_id).filter(Boolean) as string[]
							)
						)
				: []

		return tasks.map((task) =>
			buildTaskEntity(task, {
				category: categories.find((c) => c.id === task.category_id) ?? null,
				schedules: schedules.filter((s) => s.task_id === task.id),
				states: states.filter((s) => s.task_id === task.id)
			})
		)
	},

	getById: async (taskId: TaskId): Promise<TaskEntity | null> => {
		const task = await db
			.select()
			.from(tasksTable)
			.where(eq(tasksTable.id, taskId))
			.limit(1)

		if (!task[0]) return null

		const { schedules, states } = await fetchRelations([taskId])

		const category = task[0].category_id
			? (
					await db
						.select()
						.from(categoriesTable)
						.where(eq(categoriesTable.id, task[0].category_id))
						.limit(1)
				)[0]
			: null

		return buildTaskEntity(task[0], { category, schedules, states })
	},

	getByDate: async (date: string): Promise<TaskEntity[]> => {
		const schedules = await db
			.select()
			.from(schedulesTable)
			.where(
				or(
					eq(schedulesTable.date, date),
					and(
						lte(schedulesTable.start_date, date),
						gte(schedulesTable.end_date, date)
					)
				)
			)

		const taskIds = [...new Set(schedules.map((s) => s.task_id))]
		if (taskIds.length === 0) return []

		const tasks = await db
			.select()
			.from(tasksTable)
			.where(inArray(tasksTable.id, taskIds))
			.orderBy(desc(tasksTable.created_at))

		const { states } = await fetchRelations(taskIds)

		const categories =
			tasks.filter((t) => t.category_id).length > 0
				? await db
						.select()
						.from(categoriesTable)
						.where(
							inArray(
								categoriesTable.id,
								tasks.map((t) => t.category_id).filter(Boolean) as string[]
							)
						)
				: []

		return tasks.map((task) =>
			buildTaskEntity(task, {
				category: categories.find((c) => c.id === task.category_id) ?? null,
				schedules: schedules.filter((s) => s.task_id === task.id),
				states: states.filter((s) => s.task_id === task.id)
			})
		)
	},

	getSubtasks: async (taskId: TaskId): Promise<TaskEntity[]> => {
		const tasks = await db
			.select()
			.from(tasksTable)
			.where(eq(tasksTable.parent_id, taskId))
			.orderBy(asc(tasksTable.created_at))

		const taskIds = tasks.map((t) => t.id)
		const { schedules, states } = await fetchRelations(taskIds)

		return tasks.map((task) =>
			buildTaskEntity(task, {
				schedules: schedules.filter((s) => s.task_id === task.id),
				states: states.filter((s) => s.task_id === task.id)
			})
		)
	},

	getCountByPeriod: async (
		startDate: string,
		endDate: string
	): Promise<Record<string, number>> => {
		const schedules = await db
			.select()
			.from(schedulesTable)
			.where(
				and(
					gte(schedulesTable.date, startDate),
					lte(schedulesTable.date, endDate)
				)
			)

		const countByDate: Record<string, number> = {}
		schedules.forEach((schedule) => {
			if (schedule.date) {
				countByDate[schedule.date] = (countByDate[schedule.date] || 0) + 1
			}
		})

		return countByDate
	},

	create: async (info: string): Promise<TaskEntity> => {
		const now = new Date().toISOString()
		const id = randomUUID()

		await db.insert(tasksTable).values({
			id,
			info,
			status: 'active',
			type: 'task',
			created_at: now
		})

		console.log('taskRepository.create: inserted')

		return {
			id,
			info,
			status: 'active',
			state: null,
			priority: null,
			category: null,
			parent_id: null,
			schedules: [],
			created_at: now,
			updated_at: null
		}
	},

	updateState: async (
		taskId: TaskId,
		state: TaskState
	): Promise<TaskEntity> => {
		const now = new Date().toISOString()

		const existing = await db
			.select()
			.from(statesTable)
			.where(eq(statesTable.task_id, taskId))
			.limit(1)

		if (existing[0]) {
			await db
				.update(statesTable)
				.set({ state, state_date: now })
				.where(eq(statesTable.task_id, taskId))
		} else {
			await db.insert(statesTable).values({
				id: randomUUID(),
				task_id: taskId,
				state,
				state_date: now,
				created_at: now
			})
		}

		const result = await taskRepository.getById(taskId)
		if (!result) throw new Error(`Task not found: ${taskId}`)
		return result
	}
}
