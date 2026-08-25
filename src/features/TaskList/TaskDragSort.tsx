import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import type { TaskId } from '@/shared/domain/ids'
import type { TaskEntity } from '@/shared/domain/task'
import type { TaskSection } from './model/task.types'
import {
	buildDuringDaySortOrderSeed,
	generateTaskSortOrder
} from './model/task.utils'
import { useReorderDuringDayTask } from './model/useReorderDuringDayTask'
import { taskAPI } from './repository/task.api'
import TaskItem from './TaskItem'

import {
	DragSortIndicator,
	DragSortProvider,
	useDragSortAutoScroll,
	useDragSortContainerRef,
	useDragSortRow,
	useDragSortScroll,
	useSyncDragSortFlatOrder,
	type DragSortDropPayload,
	type DragSortFlatEntry
} from '@/shared/modules/DragSort'

const DURING_DAY_TITLE = 'During the day'

type TaskDragSortLayerProps = {
	tasks: TaskEntity[]
}

export function TaskDragSortLayer({ tasks }: TaskDragSortLayerProps) {
	const queryClient = useQueryClient()
	const reorderDuringDayTaskMutation = useReorderDuringDayTask()

	// Seed sort_order for tasks that don't have one yet, based on their
	// current display order, so drag-and-drop has real keys to work with.
	// Optimistically patches the cache too, so an immediate drag right
	// after entering sort mode still sees fresh sort_order values.
	useEffect(() => {
		const seed = buildDuringDaySortOrderSeed(tasks)
		if (!seed) return

		queryClient.setQueriesData<TaskSection[]>(
			{ queryKey: ['tasks-grouped'] },
			(old) =>
				old?.map((section) => {
					if (section.id !== 'during_the_day') return section
					return {
						...section,
						data: section.data.map((task) => {
							const seededOrder = seed.find((item) => item.id === task.id)
							return seededOrder
								? { ...task, sort_order: seededOrder.sort_order }
								: task
						})
					}
				})
		)

		taskAPI.updateTasksSortOrder(seed)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleDrop = useCallback(
		(payload: DragSortDropPayload<TaskId>) => {
			const prevTask = payload.prevId
				? tasks.find((task) => task.id === payload.prevId)
				: null
			const nextTask = payload.nextId
				? tasks.find((task) => task.id === payload.nextId)
				: null

			const sortOrder = generateTaskSortOrder(
				prevTask?.sort_order ?? null,
				nextTask?.sort_order ?? null
			)

			reorderDuringDayTaskMutation.mutate({
				id: payload.id,
				sortOrder,
				prevId: payload.prevId,
				nextId: payload.nextId
			})
		},
		[tasks, reorderDuringDayTaskMutation]
	)

	return (
		<DragSortProvider onDrop={handleDrop}>
			<TaskDragSortContent tasks={tasks} />
		</DragSortProvider>
	)
}

function TaskDragSortContent({ tasks }: TaskDragSortLayerProps) {
	const { scrollAnimatedRef, scrollHandler } = useDragSortScroll()
	useDragSortAutoScroll(scrollAnimatedRef)

	const flatOrder: DragSortFlatEntry<TaskId>[] = tasks.map((task) => ({
		id: task.id,
		parentId: null,
		depth: 0
	}))
	useSyncDragSortFlatOrder(flatOrder)

	const containerRef = useDragSortContainerRef()

	return (
		<Animated.ScrollView
			ref={scrollAnimatedRef}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			overScrollMode='never'
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ gap: 4 }}
		>
			<Animated.View ref={containerRef} style={{ position: 'relative' }}>
				{tasks.map((task) => (
					<TaskDragSortRow key={task.id} task={task} />
				))}
				<DragSortIndicator />
			</Animated.View>
		</Animated.ScrollView>
	)
}

function TaskDragSortRow({ task }: { task: TaskEntity }) {
	const { gesture, dragRowStyle, onLayout } = useDragSortRow<TaskId>(task.id, 0)

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View style={dragRowStyle}>
				<View onLayout={onLayout}>
					<TaskItem data={task} />
				</View>
			</Animated.View>
		</GestureDetector>
	)
}
