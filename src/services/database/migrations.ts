import { sql } from 'drizzle-orm'

import { db } from './client'

const runMigrations = async (): Promise<void> => {
	console.log('migrations: start')
	await db.run(sql`PRAGMA foreign_keys = ON`)
	console.log('migrations: pragma done')

	await db.run(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      parent_id TEXT,
      created_at TEXT NOT NULL
    )
  `)
	console.log('migrations: categories done')

	await db.run(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      info TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      priority INTEGER,
      type TEXT NOT NULL DEFAULT 'task',
      category_id TEXT REFERENCES categories(id),
      parent_id TEXT REFERENCES tasks(id),
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `)
	console.log('migrations: tasks done')

	await db.run(sql`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      date TEXT,
      weekday INTEGER,
      month_day INTEGER,
      month INTEGER,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL
    )
  `)
	console.log('migrations: schedules done')

	await db.run(sql`
    CREATE TABLE IF NOT EXISTS states (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      state TEXT NOT NULL,
      state_date TEXT,
      created_at TEXT NOT NULL
    )
  `)
	console.log('migrations: states done')

	console.log('migrations: complete')
}

export default runMigrations
