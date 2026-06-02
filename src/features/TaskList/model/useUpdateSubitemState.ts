import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity, SubitemState } from '@/shared/domain/subitem'
import { subitemAPI } from '../repository/subitem.api'

type SubitemStateMutationParams = {
	subitemId: SubitemId
	state: SubitemState
}

/**
 * Update task state mutation
 * Used for toggling subitem completion status
 */
export const useUpdateSubitemState = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ subitemId, state }: SubitemStateMutationParams) => {
			return await subitemAPI.updateSubitemState(subitemId, state)
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['subitem', variables.subitemId]
			})
			queryClient.invalidateQueries({ queryKey: ['subitems'] })
			queryClient.invalidateQueries({ queryKey: ['task-progress'] })
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			queryClient.invalidateQueries({ queryKey: ['tasks-grouped'] })
		},
		onMutate: async ({ subitemId, state }) => {
			await queryClient.cancelQueries({ queryKey: ['subitems'] })

			const previous = queryClient.getQueriesData({
				queryKey: ['subitems']
			})

			queryClient.setQueriesData(
				{
					queryKey: ['subitems']
				},
				(old: SubitemEntity[] | undefined) => {
					return old?.map((subitem) => {
						return subitem.id === subitemId ? { ...subitem, state } : subitem
					})
				}
			)

			return { previous }
		},
		onError: (_err, _vars, context) => {
			context?.previous.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
		}
	})
}
