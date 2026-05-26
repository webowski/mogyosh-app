import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { MaterialIcons } from '@expo/vector-icons'
import { useUnistyles } from 'react-native-unistyles'
import { ChecklistItem } from '../TaskList/ChecklistItem'
import type { SubitemWithChildren } from './model/subitem.types'

export type SubitemTreeVariant = 'default' | 'bulleted' | 'collapsible'

interface SubitemTreeProps {
	treeData: SubitemWithChildren[]
	depth?: number
	onToggle: (taskId: string, completed: boolean) => void
	variant?: SubitemTreeVariant
}

interface SubitemNodeProps {
	subitem: SubitemWithChildren
	depth: number
	onToggle: (taskId: string, completed: boolean) => void
	variant: SubitemTreeVariant
}

function SubitemNode({ subitem, depth, onToggle, variant }: SubitemNodeProps) {
	const { theme } = useUnistyles()
	const [isExpanded, setIsExpanded] = useState(true)
	const hasChildren = subitem.children.length > 0

	const toggleExpand = () => setIsExpanded((prev) => !prev)

	return (
		<View style={{ paddingLeft: depth * 16 }}>
			{variant === 'collapsible' ? (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{hasChildren && (
						<Pressable onPress={toggleExpand} style={{ marginRight: 4 }}>
							{isExpanded ? (
								<MaterialIcons
									name='play-arrow'
									size={18}
									color={theme.colors.major}
								/>
							) : (
								<MaterialIcons
									name='play-arrow'
									size={18}
									color={theme.colors.major}
								/>
							)}
						</Pressable>
					)}
					{!hasChildren && <View style={{ width: 16 }} />}
					<View style={{ flex: 1 }}>
						<ChecklistItem
							checked={subitem.state === 'done'}
							text={subitem.info}
							onToggle={(value) => onToggle(subitem.id, value)}
						/>
					</View>
				</View>
			) : (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{variant === 'bulleted' && (
						<Text style={{ marginRight: 6, fontSize: 16 }}>
							{getBullet(depth)}
						</Text>
					)}
					<View style={{ flex: 1 }}>
						<ChecklistItem
							checked={subitem.state === 'done'}
							text={subitem.info}
							onToggle={(value) => onToggle(subitem.id, value)}
						/>
					</View>
				</View>
			)}

			{hasChildren && (variant !== 'collapsible' || isExpanded) && (
				<SubitemTree
					treeData={subitem.children}
					depth={depth + 1}
					onToggle={onToggle}
					variant={variant}
				/>
			)}
		</View>
	)
}

// Returns bullet symbol based on nesting depth
function getBullet(depth: number): string {
	const bullets = ['•', '◦', '▪']
	return bullets[depth % bullets.length]
}

export function SubitemTree({
	treeData,
	depth = 0,
	onToggle,
	variant = 'default'
}: SubitemTreeProps) {
	return (
		<>
			{treeData.map((subitem) => (
				<SubitemNode
					key={subitem.id}
					subitem={subitem}
					depth={depth}
					onToggle={onToggle}
					variant={variant}
				/>
			))}
		</>
	)
}
