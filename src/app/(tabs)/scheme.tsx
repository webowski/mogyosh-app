import { useRouter } from 'expo-router'
import { ActivityIndicator, Text, useWindowDimensions } from 'react-native'

import { MindMap } from '@/features/MindMap/MindMap'
import { MindMapNode } from '@/features/MindMap/model/types'
import { useNavStore } from '@/features/Navigation/model/navStore'
import { useTasksByCategory } from '@/features/TaskList/model'
import { TaskCategoryGroupEntity } from '@/features/TaskList/model/task.types'
import { useTaskStore } from '@/shared/model/taskStore'

function mapCategoryGroupToMindMapNode(
	group: TaskCategoryGroupEntity
): MindMapNode {
	const children: MindMapNode[] = []

	if (group.children) {
		for (const child of group.children) {
			children.push(mapCategoryGroupToMindMapNode(child))
		}
	}

	for (const task of group.tasks) {
		children.push({
			id: task.id,
			label: task.info,
			type: 'task'
		})
	}

	const isSubcategory =
		group.category.parent_id !== null && group.category.parent_id !== undefined

	return {
		id: group.category.id,
		label: group.category.name,
		type: isSubcategory ? 'subcategory' : 'category',
		children: children.length > 0 ? children : undefined
	}
}

function buildMindMapData(groups: TaskCategoryGroupEntity[]): MindMapNode {
	const children = groups.map(mapCategoryGroupToMindMapNode)

	return {
		id: 'root',
		label: 'Categories',
		type: 'root',
		children: children.length > 0 ? children : undefined
	}
}

export default function SchemeScreen() {
	const router = useRouter()
	const { width, height } = useWindowDimensions()
	const { data: groups, isLoading, error } = useTasksByCategory()

	const setSelectedTaskId = useTaskStore((store) => store.setSelectedTaskId)
	const setSwipePosition = useNavStore((store) => store.setSwipePosition)

	const handleTaskPress = (taskId: string) => {
		setSelectedTaskId(taskId)
		setSwipePosition({ row: 0, col: 2 })
		router.push('/task')
	}

	if (isLoading) {
		return <ActivityIndicator />
	}

	if (error) {
		return <Text>Error loading data</Text>
	}

	const mindMapData = buildMindMapData(groups ?? [])

	return (
		<MindMap
			data={mindMapData}
			width={width}
			height={height - 94 - 43}
			onTaskPress={handleTaskPress}
		/>
	)
}
