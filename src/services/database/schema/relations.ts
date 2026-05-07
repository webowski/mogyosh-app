import { relations } from 'drizzle-orm'
import { categories } from './categories'
import { schedules } from './schedules'
import { states } from './states'
import { tasks } from './tasks'

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	category: one(categories, {
		fields: [tasks.category_id],
		references: [categories.id]
	}),
	schedules: many(schedules),
	states: many(states),
	subtasks: many(tasks, {
		relationName: 'subtasks'
	}),
	parent: one(tasks, {
		fields: [tasks.parent_id],
		references: [tasks.id],
		relationName: 'subtasks'
	})
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
	tasks: many(tasks)
}))

export const schedulesRelations = relations(schedules, ({ one }) => ({
	task: one(tasks, {
		fields: [schedules.task_id],
		references: [tasks.id]
	})
}))

export const statesRelations = relations(states, ({ one }) => ({
	task: one(tasks, {
		fields: [states.task_id],
		references: [tasks.id]
	})
}))
