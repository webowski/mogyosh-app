import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { TaskCategoryGroupEntity } from '@/features/TaskList/model'
import TaskListItem from './TaskListItem'

type TaskCategoryGroupProps = {
	group: TaskCategoryGroupEntity
	searchQuery?: string
	level?: number
}

export default function TaskCategoryGroup({
	group,
	searchQuery = '',
	level = 0
}: TaskCategoryGroupProps) {
	const [isExpanded, setIsExpanded] = useState(true)

	// Filter tasks by search query
	const filteredTasks = group.tasks.filter((task) => {
		if (!searchQuery) return true
		return task.info.toLowerCase().includes(searchQuery.toLowerCase())
	})

	// Recursively filter children categories
	const filteredChildren = group.children
		?.map((child) => {
			const hasMatchingTasks = child.tasks.some((task) =>
				task.info.toLowerCase().includes(searchQuery.toLowerCase())
			)
			const hasMatchingChildren = child.children?.some((grandchild) =>
				grandchild.tasks.some((task) =>
					task.info.toLowerCase().includes(searchQuery.toLowerCase())
				)
			)

			if (hasMatchingTasks || hasMatchingChildren) {
				return child
			}
			return null
		})
		.filter(Boolean) as TaskCategoryGroupEntity[] | undefined

	// Show category if it has matching tasks or children
	const shouldShow =
		filteredTasks.length > 0 ||
		(filteredChildren && filteredChildren.length > 0)

	if (!shouldShow && searchQuery) {
		return null
	}

	// const hasChildren = group.children && group.children.length > 0

	return (
		<View style={{ marginLeft: level * 16 }}>
			<Pressable
				onPress={() => setIsExpanded(!isExpanded)}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					padding: 12,
					backgroundColor: level === 0 ? '#f0f0f0' : '#f8f8f8',
					borderRadius: 8,
					marginVertical: 4
				}}
			>
				<Text style={{ fontSize: 12, marginRight: 8 }}>
					{isExpanded ? '▼' : '▶'}
				</Text>
				<Text style={{ fontSize: 16, fontWeight: '600' }}>
					{group.category.name}
				</Text>
				<Text style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
					({filteredTasks.length})
				</Text>
			</Pressable>

			{isExpanded && (
				<View>
					{filteredTasks.map((task) => (
						<TaskListItem key={task.id} data={task} />
					))}

					{filteredChildren?.map((child) => (
						<TaskCategoryGroup
							key={child.category.id}
							group={child}
							searchQuery={searchQuery}
							level={level + 1}
						/>
					))}
				</View>
			)}
		</View>
	)
}
