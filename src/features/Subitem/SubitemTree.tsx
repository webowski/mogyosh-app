import { View } from 'react-native'
import { ChecklistItem } from '../TaskList/ChecklistItem'
import { SubitemWithChildren } from './model/subitem.types'

interface SubitemTreeProps {
	treeData: SubitemWithChildren[]
	depth?: number
	onToggle: (taskId: string, completed: boolean) => void
}

export function SubitemTree({
	treeData,
	depth = 0,
	onToggle
}: SubitemTreeProps) {
	return (
		<>
			{treeData.map((subitem) => (
				<View key={subitem.id} style={{ paddingLeft: depth * 16 }}>
					<ChecklistItem
						checked={subitem.state === 'done'}
						text={subitem.info}
						onToggle={(value) => onToggle(subitem.id, value)}
					/>
					{subitem.children.length > 0 && (
						<SubitemTree
							treeData={subitem.children}
							depth={depth + 1}
							onToggle={onToggle}
						/>
					)}
				</View>
			))}
		</>
	)
}
