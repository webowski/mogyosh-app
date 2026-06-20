import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SubitemId } from '@/shared/domain/ids'
import { SubitemEntity } from '@/shared/domain/subitem'
import { subitemAPI } from '../repository/subitem.api'

export const useRemoveSubitem = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id }: { id: SubitemId; taskId: string | null }) =>
			subitemAPI.deleteSubitem(id),
		onMutate: async ({ id, taskId }) => {
			// Отменяем текущие запросы чтобы не перезатёрли оптимистичное состояние
			await queryClient.cancelQueries({ queryKey: ['subitems', taskId] })

			// Сохраняем снапшот
			const previousSubitems = queryClient.getQueryData(['subitems', taskId])

			// Оптимистично убираем из кэша
			queryClient.setQueryData(
				['subitems', taskId],
				(oldSubitems: SubitemEntity[]) => {
					return oldSubitems?.filter((subitem) => subitem.id !== id) ?? []
				}
			)

			return { previousSubitems, taskId }
		},
		onError: (_err, _vars, context) => {
			// Откатываем при ошибке
			queryClient.setQueryData(
				['subitems', context?.taskId],
				context?.previousSubitems
			)
		},
		onSettled: (_data, _err, { taskId }) => {
			queryClient.invalidateQueries({ queryKey: ['subitems', taskId] })
		}
	})
}
