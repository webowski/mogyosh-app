import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
