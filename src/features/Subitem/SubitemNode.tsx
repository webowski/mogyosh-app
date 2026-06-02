import { View } from 'react-native'

import type { SubitemId } from '@/shared/domain/ids'
import type { SubitemType } from '@/shared/domain/subitem'
import { useState } from 'react'
import { useUpdateSubitemState } from '../TaskList'
import type { SubitemData } from './model/subitem.types'
import TextSubitem from './variants/TextSubitem'

interface SubitemNodeProps {
	data: SubitemData
	depth: number
	// onCheckToggle: (subitemId: SubitemId, checked: boolean) => void
	variant: SubitemType
}

export default function SubitemNode({
	data,
	variant = 'text',
	depth = 0
}: SubitemNodeProps) {
	const [isChildShown, setIsChildShown] = useState(true)
	// const hasChildren = data.children.length > 0

	let HAS_CHECKBOX = true

	const updateSubitemState = useUpdateSubitemState()

	const handleToggleSubitem = (subitemId: SubitemId, completed: boolean) => {
		updateSubitemState.mutate({
			subitemId,
			state: completed ? 'done' : 'active'
		})
	}

	let content = (
		<TextSubitem
			data={data}
			onCheckToggle={(checked) => handleToggleSubitem(data.id, checked)}
		/>
	)

	// let content = undefined

	// switch (variant) {
	// 	case 'collapsible':
	// 		content = (
	// 			<CollapsibleSubitem
	// 				data={data}
	// 				depth={depth}
	// 				onCheckToggle={onCheckToggle}
	// 				onExpandToggle={(value) => setIsChildShown(value)}
	// 			/>
	// 		)
	// 		break

	// 	case 'bulleted':
	// 		content = (
	// 			<BulletedSubitem
	// 				data={data}
	// 				depth={depth}
	// 				onCheckToggle={onCheckToggle}
	// 			/>
	// 		)
	// 		break

	// 	case 'text':
	// 		content = (
	// 			<TextSubitem data={data} depth={depth} onCheckToggle={onCheckToggle} />
	// 		)
	// }

	return (
		<View style={{ paddingLeft: depth * 16 }}>
			{content}

			{isChildShown && (
				<>
					{data.children.map((child) => (
						<SubitemNode
							key={child.id}
							data={child}
							depth={depth + 1}
							variant={variant}
						/>
					))}
				</>
			)}
		</View>
	)
}
