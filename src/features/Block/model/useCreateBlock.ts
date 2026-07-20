import { BlockEntity } from '@/shared/domain/block'
import { BlockId, TaskId } from '@/shared/domain/ids'
import { useQueryClient } from '@tanstack/react-query'
import {
	generateBlockSortOrder,
	selectBlocks,
	useBlockStore
} from './block.store'

export const useCreateBlock = () => {
	const queryClient = useQueryClient()
	const { addBlock, enqueueOperation } = useBlockStore.getState()

	const mutate = (
		payload: {
			text_content: string
			task_id: TaskId | null
			parent_id?: BlockId | null
			type?: BlockEntity['type']
			settings?: BlockEntity['settings']
			optimisticId?: BlockId
			afterId?: BlockId | null
		},
		options?: { onSuccess?: (block: BlockEntity) => void }
	) => {
		const taskId = payload.task_id as TaskId
		const blocks = selectBlocks(taskId)(useBlockStore.getState())

		const tempId = (payload.optimisticId ??
			`optimistic-${Date.now()}`) as BlockId
		const sort_order = generateBlockSortOrder(
			blocks,
			payload.afterId ?? null,
			payload.parent_id ?? null
		)

		const optimisticBlock: BlockEntity = {
			id: tempId,
			task_id: taskId,
			parent_id: payload.parent_id ?? null,
			type: payload.type ?? 'p',
			text_content: payload.text_content,
			status: null,
			settings: payload.settings ?? {},
			priority: null,
			sort_order,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}

		// 1. Instantly update UI via store
		addBlock(payload.afterId ?? null, optimisticBlock)

		// 2. Enqueue for server sync
		enqueueOperation({
			type: 'create',
			block: optimisticBlock,
			tempId
		})

		// Invalidate task counters
		queryClient.invalidateQueries({ queryKey: ['tasks'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
		queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })

		return { tempId, optimisticBlock }
	}

	return { mutate }
}
