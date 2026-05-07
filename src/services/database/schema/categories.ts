import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { tasks } from './tasks'

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	parent_id: text('parent_id'),
	created_at: text('created_at')
})

export const categoriesRelations = relations(categories, ({ many }) => ({
	tasks: many(tasks)
}))
