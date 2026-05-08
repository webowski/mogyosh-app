// src/services/database/schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categoriesTable = sqliteTable('categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	parent_id: text('parent_id'),
	created_at: text('created_at').notNull().default(new Date().toISOString())
})

export const tasksTable = sqliteTable('tasks', {
	id: text('id').primaryKey(),
	info: text('info'),
	status: text('status').notNull().default('active'),
	priority: integer('priority'),
	type: text('type').notNull().default('task'),
	category_id: text('category_id').references(() => categoriesTable.id),
	parent_id: text('parent_id'),
	created_at: text('created_at').notNull().default(new Date().toISOString()),
	updated_at: text('updated_at')
})

export const schedulesTable = sqliteTable('schedules', {
	id: text('id').primaryKey(),
	task_id: text('task_id')
		.notNull()
		.references(() => tasksTable.id, { onDelete: 'cascade' }),
	type: text('type').notNull(),
	start_time: text('start_time'),
	end_time: text('end_time'),
	date: text('date'),
	weekday: integer('weekday'),
	month_day: integer('month_day'),
	month: integer('month'),
	start_date: text('start_date'),
	end_date: text('end_date'),
	created_at: text('created_at').notNull().default(new Date().toISOString())
})

export const statesTable = sqliteTable('states', {
	id: text('id').primaryKey(),
	task_id: text('task_id')
		.notNull()
		.references(() => tasksTable.id, { onDelete: 'cascade' }),
	state: text('state').notNull(),
	state_date: text('state_date'),
	created_at: text('created_at').notNull().default(new Date().toISOString())
})
