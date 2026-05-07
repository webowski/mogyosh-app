import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'
import { schedules } from './schedules'
import { states } from './states'

export const tasks = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	info: text('info').notNull(),
	status: text('status', { enum: ['active', 'completed', 'archived'] })
		.notNull()
		.default('active'),
	priority: integer('priority'),
	parent_id: text('parent_id'),
	category_id: text('category_id'),
	created_at: text('created_at').notNull(),
	updated_at: text('updated_at')
})

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
