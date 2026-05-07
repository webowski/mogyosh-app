import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { tasks } from './tasks'

export const states = sqliteTable('states', {
	id: text('id').primaryKey(),
	task_id: text('task_id').notNull(),
	state: text('state', { enum: ['done', 'active', 'archived'] }).notNull(),
	state_date: text('state_date'),
	created_at: text('created_at')
})

export const statesRelations = relations(states, ({ one }) => ({
	task: one(tasks, {
		fields: [states.task_id],
		references: [tasks.id]
	})
}))
