import type { Config } from 'drizzle-kit'

export default {
	schema: './src/services/database/schema/index.ts',
	out: './src/services/database/migrations',
	dialect: 'sqlite',
	dbCredentials: {
		url: './mogyosh.db'
	},
	verbose: true,
	strict: true
} satisfies Config
