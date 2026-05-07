import { db } from '@/services/database/client'
import { categories } from '@/services/database/schema'
import { CategoryEntity } from '@/shared/domain/task'

export const categoryRepository = {
	async getCategories(): Promise<CategoryEntity[]> {
		const rows = await db.select().from(categories)
		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			parent_id: row.parent_id ?? null
		}))
	}
}
