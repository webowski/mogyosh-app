import type { SubitemId } from '@/shared/domain/ids'
import { useMotivationStore } from './motivation.store'

export const useRemoveMotivationSubitem = () => {
	const { removeSubitem, enqueueOperation } = useMotivationStore.getState()

	const mutate = (payload: { id: SubitemId }) => {
		// 1. Instantly update UI
		removeSubitem(payload.id)

		// 2. Enqueue for server sync
		enqueueOperation({
			type: 'delete',
			id: payload.id
		})
	}

	return { mutate }
}
