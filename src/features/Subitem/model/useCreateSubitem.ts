import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SubitemId, TaskId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { subitemAPI } from '../repository/subitem.api'

export const useCreateSubitem = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: subitemAPI.createSubitem,
		onMutate: async (payload) => {
			const taskId = payload.task_id ?? null
			await queryClient.cancelQueries({ queryKey: ['subitems', taskId] })

			const previousSubitems = queryClient.getQueryData<SubitemEntity[]>([
				'subitems',
				taskId
			])

			const optimisticSubitem: SubitemEntity = {
				id: (payload.optimisticId ?? `optimistic-${Date.now()}`) as SubitemId,
				task_id: taskId as TaskId,
				parent_id: payload.parent_id ?? null,
				type: payload.type ?? 'p',
				info: payload.info,
				status: null,
				settings: null,
				state: null,
				priority: null,
				sort_order: null,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			}

			queryClient.setQueryData<SubitemEntity[]>(['subitems', taskId], (old) => [
				...(old ?? []),
				optimisticSubitem
			])

			return { previousSubitems, taskId, optimisticId: optimisticSubitem.id }
		},
		onError: (_err, _payload, context) => {
			queryClient.setQueryData(
				['subitems', context?.taskId],
				context?.previousSubitems
			)
		},
		onSuccess: (newSubitem, payload, context) => {
			// Replace optimistic item with real one
			queryClient.setQueryData<SubitemEntity[]>(
				['subitems', context?.taskId],
				(old) =>
					old?.map((s) => (s.id === context?.optimisticId ? newSubitem : s)) ??
					[]
			)
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-flat'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-by-date'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-period'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-count-day'] })
		},
		onSettled: (_data, _err, payload) => {
			queryClient.invalidateQueries({
				queryKey: ['subitems', payload.task_id ?? null]
			})
		}
	})
}
