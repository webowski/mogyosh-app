import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const schedules = sqliteTable('schedules', {
	id: text('id').primaryKey(),
	task_id: text('task_id').notNull(),
	type: text('type', {
		enum: ['once', 'weekday', 'daily', 'weekly', 'monthly']
	}).notNull(),
	start_time: text('start_time'),
	end_time: text('end_time'),
	date: text('date'),
	weekday: integer('weekday'),
	month_day: integer('month_day'),
	month: integer('month'),
	start_date: text('start_date'),
	end_date: text('end_date'),
	created_at: text('created_at')
})
