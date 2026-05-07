import { open } from '@op-engineering/op-sqlite'

const sqlite = open({
	name: 'mogyosh.db'
})

const INITIAL_MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "categories" (
	"id" TEXT PRIMARY KEY NOT NULL,
	"name" TEXT NOT NULL,
	"parent_id" TEXT,
	"created_at" TEXT
);

CREATE TABLE IF NOT EXISTS "tasks" (
	"id" TEXT PRIMARY KEY NOT NULL,
	"info" TEXT NOT NULL,
	"status" TEXT DEFAULT 'active' NOT NULL,
	"priority" INTEGER,
	"parent_id" TEXT,
	"category_id" TEXT,
	"created_at" TEXT NOT NULL,
	"updated_at" TEXT
);

CREATE TABLE IF NOT EXISTS "schedules" (
	"id" TEXT PRIMARY KEY NOT NULL,
	"task_id" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"start_time" TEXT,
	"end_time" TEXT,
	"date" TEXT,
	"weekday" INTEGER,
	"month_day" INTEGER,
	"month" INTEGER,
	"start_date" TEXT,
	"end_date" TEXT,
	"created_at" TEXT
);

CREATE TABLE IF NOT EXISTS "states" (
	"id" TEXT PRIMARY KEY NOT NULL,
	"task_id" TEXT NOT NULL,
	"state" TEXT NOT NULL,
	"state_date" TEXT,
	"created_at" TEXT
);

CREATE INDEX IF NOT EXISTS "tasks_parent_id_idx" ON "tasks" ("parent_id");
CREATE INDEX IF NOT EXISTS "tasks_category_id_idx" ON "tasks" ("category_id");
CREATE INDEX IF NOT EXISTS "schedules_task_id_idx" ON "schedules" ("task_id");
CREATE INDEX IF NOT EXISTS "schedules_date_idx" ON "schedules" ("date");
CREATE INDEX IF NOT EXISTS "states_task_id_idx" ON "states" ("task_id");
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories" ("parent_id");
`

export async function runMigrations() {
	try {
		sqlite.execute(INITIAL_MIGRATION_SQL)
		console.log('Database migrations completed successfully')
	} catch (error) {
		console.error('Database migration failed:', error)
		throw error
	}
}
