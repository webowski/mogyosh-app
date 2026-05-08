import { db } from '@/services/database/client'
import { categoriesTable } from '@/services/database/schema'
import type { CategoryEntity } from '@/shared/domain/task'

export const categoryRepository = {
	getAll: async (): Promise<CategoryEntity[]> => {
		const rows = await db.select().from(categoriesTable)
		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			parent_id: row.parent_id
		}))
	}
}
